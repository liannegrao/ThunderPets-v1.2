import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PetsService, Pet } from '../../services/pets.service';

interface Testimonial {
  text: string;
  img: string;
  name: string;
  info: string;
}

interface DisponibilidadeOption {
  value: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  isAdmin = false; // Depends on user auth

  carouselSlides: string[] = [
    '/img/Design%20sem%20nome.jpg',
    '/img/raca-de-cachorro_2.jpg',
    '/img/shihtzunsc.jpg',
    '/img/cachorro-_1750287085273-750x375.webp'
  ];
  currentSlideIndex = 0;
  private carouselInterval: any;

  matchingForm!: FormGroup;

  disponibilidadeOptions: DisponibilidadeOption[] = [
    { value: 'poucas-horas', label: 'Poucas horas/dia', emoji: '⏰' },
    { value: 'metade-dia', label: 'Meia jornada', emoji: '🌙' },
    { value: 'todo-dia', label: 'Todo o dia', emoji: '🏠' },
    { value: 'flexivel', label: 'Horário flexível', emoji: '🔄' }
  ];

  isMatching = false;
  showResults = false;
  matchedPets: Pet[] = [];
  hasMoreResults = false;

  // Modal for pet details
  showPetModal = false;
  selectedPet: Pet | null = null;

  // Matched pets will be loaded from service

  testimonials: Testimonial[] = [
    {
      text: 'Adotar o Max mudou minha vida. Ele me ajudou a superar momentos difíceis.',
      img: '/img/mulher-feliz-com-seu-cachorro-fofo_23-2148345885.avif',
      name: 'Ana Silva',
      info: 'Adotante há 2 anos'
    },
    // Add more testimonials
  ];

  showcasedPets: Pet[] = [];

  constructor(
    private fb: FormBuilder,
    private petsService: PetsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.matchingForm = this.fb.group({
      situacao: [''],
      energia: [''],
      'poucas-horas': [false],
      'metade-dia': [false],
      'todo-dia': [false],
      'flexivel': [false]
    });

    // Load showcased pets (hardcoded selection for main page)
    this.showcasedPets = []; // Temporariamente vazio até ter dados da API

    // Carregar dados iniciais diretamente do petsService
    this.petsService.pets$.subscribe(pets => {
      if (pets.length > 0) {
        const pet1 = pets.find(p => p.id === 1);
        const pet2 = pets.find(p => p.id === 2);
        const pet3 = pets.find(p => p.id === 4);
        this.showcasedPets = [pet1, pet2, pet3].filter(pet => pet !== undefined) as Pet[];
      }
    });

    // Start carousel
    this.startCarousel();
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.carouselSlides.length;
  }

  openLoginModal() {
    // Implement modal logic later
    console.log('Abrir modal de login');
  }

  openCadastroModal() {
    // Implement modal logic later
    console.log('Abrir modal de cadastro');
  }

  onMatchSubmit() {
    if (this.matchingForm.invalid) {
      console.log('Formulário inválido');
      return;
    }

    this.isMatching = true;
    this.showResults = false;

    // Coletar dados do formulário
    const formValue = this.matchingForm.value;
    const disponibilidadeSelecionada = Object.keys(formValue)
      .filter(key => key !== 'situacao' && key !== 'energia' && formValue[key])
      .map(key => key);

    const userPreferences = {
      situacao: formValue.situacao,
      energia: formValue.energia,
      disponibilidade: disponibilidadeSelecionada
    };

    console.log('🎯 Buscando matches via API:', userPreferences);

    // Usar API para matching
    this.petsService.findTherapeuticMatches(userPreferences).subscribe({
      next: (matches) => {
        this.isMatching = false;
        this.showResults = true;
        this.matchedPets = matches.slice(0, 3); // Mostrar 3 primeiros
        this.hasMoreResults = matches.length > 3;

        console.log(`💚 API: ${matches.length} pets compatíveis encontrados`);
      },
      error: (error) => {
        console.error('❌ Erro no matching via API:', error);
        this.isMatching = false;
        // Fallback: usar dados locais
        this.matchedPets = this.showcasedPets.slice(0, 3);
        this.hasMoreResults = false;
        this.showResults = true;
        console.log('⚠️ Fallback: usando dados locais');
      }
    });
  }

  openPetDetails(pet: Pet) {
    this.selectedPet = pet;
    this.showPetModal = true;
    // Impedir scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
  }

  closePetModal() {
    this.showPetModal = false;
    this.selectedPet = null;
    // Reabilitar scroll do body
    document.body.style.overflow = 'auto';
  }

  // Event listener para fechar modal quando clicar no overlay
  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('pet-modal-overlay')) {
      this.closePetModal();
    }
  }

  adoptPet(pet: Pet) {
    console.log('Processando adoção:', pet);

    // Verificar se usuário está logado
    const currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');

    if (!currentUser) {
      alert('Para adotar, você precisa estar logado. Redirecionando para login...');
      this.router.navigate(['/auth']);
      return;
    }

    // Verificar se usuário tem papel adequado para adoção
    if (currentUser.role === 'doador') {
      const confirmacao = confirm(`${currentUser.nome}, você está registrado como Doador.\n\nSe você deseja receber um pet terapêutico, clique em "OK" para ir ao formulário de solicitação.\n\nSe deseja cancelar, clique em "Cancelar".`);

      if (confirmacao) {
        alert(`Você será redirecionado para o formulário de solicitação de cuidado terapêutico com pets.\n\nEm seguida, analisaremos sua solicitação e estabeleceremos o contato com donos de pets disponíveis.`);
        this.router.navigate(['/doar'], {
          queryParams: {
            pet: pet.id,
            motivo: 'adocao_terapeutica'
          }
        });
      }

    } else if (currentUser.role === 'voluntario') {
      alert(`${currentUser.nome}, como Voluntário, você pode ajudar nas adoções mas não pode adotar pets diretamente.\n\nEntre em contato conosco para saber como ajudar!`);
      // Poderia abrir modal de contato ou redirecionar

    } else if (currentUser.role === 'mediador') {
      // Mediador pode aprovar adoções diretamente
      const confirmacao = confirm(`${currentUser.nome}, você tem permissão de Mediador.\n\nDeseja marcar este pet como adotado pelo sistema?`);

      if (confirmacao) {
        // Marcar pet como adotado
        if (pet.adotado) {
          alert('Este pet já foi adotado.');
        } else {
          this.petsService.adoptPet(pet.id);
          alert(`✅ ${pet.nome} marcado como adotado!`);
          // Fechar modal e recarregar dados
          this.closePetModal();
          // Em produção: recarregar a lista de pets
        }
      }

    } else {
      // Usuário comum
      const confirmacao = confirm(`${currentUser.nome}, obrigado pelo interesse!\n\nPara adotar ${pet.nome}, você precisa passar por uma avaliação terapêutica.\n\nIsso garante que a adoção seja benéfica para ambos.\n\nDeseja iniciar o processo de avaliação?`);

      if (confirmacao) {
        alert('Você será redirecionado para o formulário de solicitação de cuidado terapêutico.\n\nAvaliaremos suas necessidades e encontraremos o pet mais compatível.');
        this.router.navigate(['/doar'], {
          queryParams: {
            pet: pet.id,
            motivo: 'avaliacao_terapeutica'
          }
        });
      }
    }
  }

  onShowMoreResults() {
    // Mostrar todos os pets matched - reforçar dados atuais
    this.matchedPets = [...this.matchedPets, ...this.matchedPets]; // Duplicar para demo
    this.hasMoreResults = false;
  }

  // Método auxiliar para calcular idade formatada
  getFormattedAge(idadeMeses: number): string {
    const anos = Math.floor(idadeMeses / 12);
    const meses = idadeMeses % 12;
    if (anos === 0) {
      return `${meses} meses`;
    } else if (meses === 0) {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} meses`;
    }
  }

  // Método auxiliar para capitalizar primeira letra
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
