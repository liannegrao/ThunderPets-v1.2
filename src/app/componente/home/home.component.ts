import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Pet {
  nome: string;
  foto: string;
  alt: string;
  beneficio: string;
  perfil: string;
  descricao: string;
  personalidade?: string;
}

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

  // Example available pets
  availablePets: Pet[] = [
    {
      nome: 'Buddy',
      foto: '/img/cachorro-caramelo-Petlove.jpg',
      alt: 'Cachorro Buddy',
      beneficio: 'Apoio contra ansiedade',
      perfil: 'Cachorro de porte médio',
      descricao: 'Buddy é um cachorro muito afetuoso e ideal para quem precisa de companhia em momentos de stress.',
      personalidade: 'Calmo e terno'
    },
    // Add more pets as needed
  ];

  testimonials: Testimonial[] = [
    {
      text: 'Adotar o Max mudou minha vida. Ele me ajudou a superar momentos difíceis.',
      img: '/img/mulher-feliz-com-seu-cachorro-fofo_23-2148345885.avif',
      name: 'Ana Silva',
      info: 'Adotante há 2 anos'
    },
    // Add more testimonials
  ];

  showcasedPets: Pet[] = [
    {
      nome: 'Biscoito',
      foto: '/img/cachorro-caramelo-Petlove.jpg',
      alt: 'Foto do Biscoito, companheiro terapêutico energético',
      beneficio: 'Energia & Alegria',
      perfil: 'Extrovertido Ativo',
      descricao: 'Perfeito para combater inércia depressiva e isolamento. Sua energia contagiante ajuda a estabelecer rotina, exercícios e socialização, fundamentais para recuperação emocional.',
      personalidade: 'Energético'
    },
    {
      nome: 'Lua',
      foto: '/img/pexels-photo-2247894.jpeg',
      alt: 'Foto da Lua, companheira terapêutica calma',
      beneficio: 'Calma & Serenidade',
      perfil: 'Pacífica Independente',
      descricao: 'Ideal para ansiedade e insônia. Sua presença constante e ronronar terapêutico ajudam a criar ambiente de paz, essencial para reorganização emocional e relaxamento.',
      personalidade: 'Calma'
    },
    {
      nome: 'Thor',
      foto: '/img/raca-de-cachorro-preto.jpg',
      alt: 'Foto do Thor, companheiro terapêutico social',
      beneficio: 'Socialização & Conexão',
      perfil: 'Sociável Brincalhão',
      descricao: 'Especialista em combater isolamento social. Sua alegria e brincadeiras ajudam a reconstruir conexões emocionais, trazendo vida e propósito diário para qualquer lar.',
      personalidade: 'Sociável'
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.matchingForm = this.fb.group({
      situacao: [''],
      energia: [''],
      'poucas-horas': [false],
      'metade-dia': [false],
      'todo-dia': [false],
      'flexivel': [false]
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
    this.isMatching = true;
    // Simulate matching process
    setTimeout(() => {
      this.isMatching = false;
      this.showResults = true;
      // Basic matching logic - return first 2 pets
      this.matchedPets = this.availablePets.slice(0, 2);
      this.hasMoreResults = this.availablePets.length > 2;
    }, 2000);
  }

  adoptPet(pet: Pet) {
    console.log('Adotar pet:', pet);
    // Implement adoption flow
  }

  showMoreResults() {
    // Show all matched pets
    this.matchedPets = this.availablePets;
    this.hasMoreResults = false;
  }

  onShowMoreResults() {
    this.showMoreResults();
  }
}
