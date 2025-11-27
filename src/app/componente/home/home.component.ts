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

    console.log('👤 Usuário no home:', currentUser);

    // Se não tem usuário no localStorage, mostrar mensagem de login
    if (!currentUser || !currentUser.nome) {
      alert('Para adotar, você precisa estar logado. Redirecionando para login...');
      this.router.navigate(['/auth']);
      return;
    }

    console.log('✅ Usuário validado no home:', currentUser.nome, 'Role:', currentUser.role);

    // Para TODOS os usuários logados: mostrar mensagem simples e redirecionar
    const confirmacao = confirm(`${pet.nome} foi adicionado ao seu painel de adotante! 🍇\n\nVocê pode visualizar todas as suas solicitações de adoção no seu painel personalizado.`);

    if (confirmacao) {
      // Redirecionar para painel adotante
      this.router.navigate(['/painel-adotante']);
    }
  }

  onShowMoreResults() {
    // Mostrar todos os pets matched - reforçar dados atuais
    this.matchedPets = [...this.matchedPets, ...this.matchedPets]; // Duplicar para demo
    this.hasMoreResults = false;
  }

  // Método auxiliar para obter top scores de compatibilidade
  getTopScores(pet: Pet): { label: string, value: number }[] {
    // Proteção contra compatibilidadeScore undefined ou propriedades individuais undefined
    const scoreDepressao = pet?.compatibilidadeScore?.depressao || 50;
    const scoreAnsiedade = pet?.compatibilidadeScore?.ansiedade || 50;
    const scoreSolidao = pet?.compatibilidadeScore?.solidao || 50;

    const scores = [
      { label: 'Depressão', value: scoreDepressao },
      { label: 'Ansiedade', value: scoreAnsiedade },
      { label: 'Solidão', value: scoreSolidao }
    ];
    return scores.sort((a, b) => b.value - a.value).slice(0, 3);
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

  // Método para obter o papel do usuário logado
  getUserRole(): string | null {
    try {
      const currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');
      return currentUser?.role || null;
    } catch {
      return null;
    }
  }

  // Método para verificar se usuário está logado
  isUserLoggedIn(): boolean {
    const userRole = this.getUserRole();
    return userRole !== null && userRole !== undefined;
  }
}
