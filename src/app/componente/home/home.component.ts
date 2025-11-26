import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  constructor(private fb: FormBuilder, private petsService: PetsService) {}

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
    this.showcasedPets = [
      this.petsService.getPetById(1), // Biscoito
      this.petsService.getPetById(4), // Luna (wait, Biscoito is 1, Thor is 2, Buddy is 3, Luna is 4)
      this.petsService.getPetById(2), // Thor
    ].filter(pet => pet !== undefined) as Pet[];

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

    // Forçar recarga de pets externos antes do matching
    this.petsService.refreshExternalPets();
    console.log('🎯 Buscando matches com', this.petsService.getTotalPets());
    console.log('Preferências:', userPreferences);

    // Simular análise terapêutica
    setTimeout(() => {
      try {
        // Usar o serviço de pets para matching real
        const matches = this.petsService.findTherapeuticMatches(userPreferences);

        this.isMatching = false;
        this.showResults = true;
        this.matchedPets = matches.slice(0, 3); // Mostrar 3 primeiros
        this.hasMoreResults = matches.length > 3;

    console.log(`💚 Encontrados ${matches.length} pets compatíveis` + (this.petsService.getAllPets().length > 6 ? ' (incluindo pets cadastrados)' : ''));
      } catch (error) {
        console.error('Erro no matching:', error);
        this.isMatching = false;
        // Fallback: mostrar pets de showcase
        this.matchedPets = this.petsService.getAllPets().slice(0, 3);
        this.hasMoreResults = false;
      }
    }, 2000); // 2 segundos para simular análise
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
    // TODO: Implementar fluxo de adoção
    // Por enquanto, só log
    alert(`Obrigado por se interessar pelo ${pet.nome}! Em breve implementaremos o processo de adoção.`);
  }

  onShowMoreResults() {
    // Mostrar todos os pets matched
    const allMatches = this.petsService.getAllPets().filter(pet =>
      this.matchedPets.some(matched => matched.id === pet.id)
    );
    this.matchedPets = allMatches;
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
