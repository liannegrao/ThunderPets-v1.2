import { Component, OnInit } from '@angular/core';
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
export class HomeComponent implements OnInit {

  isAdmin = false; // Depends on user auth

  currentSlide = '/img/cachorro-_1750287085273-750x375.webp'; // Default slide

  matchingForm!: FormGroup;

  disponibilidadeOptions: DisponibilidadeOption[] = [
    { value: 'manha', label: 'Manhã (6h - 12h)', emoji: '🌅' },
    { value: 'tarde', label: 'Tarde (12h - 18h)', emoji: '🌇' },
    { value: 'noite', label: 'Noite (18h - 22h)', emoji: '🌙' },
    { value: 'semanal', label: 'Finais de Semana', emoji: '🏖️' },
    { value: 'integral', label: 'Disponível Integralmente', emoji: '🔄' }
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

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.matchingForm = this.fb.group({
      situacao: [''],
      energia: [''],
      manha: [false],
      tarde: [false],
      noite: [false],
      semanal: [false],
      integral: [false]
    });
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
}
