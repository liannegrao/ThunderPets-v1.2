import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PetsService, Pet } from '../../services/pets.service';
import { DepoimentoService } from '../../services/depoimento.service';
import { AdocaoService } from '../../services/adocao.service';

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

interface UnifiedDepoimento {
  text: string;
  img: string;
  name: string;
  info: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  isAdmin = false; // Depends on user auth

  carouselSlides: string[] = [
    '/img/Design%20sem%20nome.jpg',
    '/img/raca-de-cachorro_2.jpg',
    '/img/shihtzunsc.jpg',
    '/img/cachorro-_1750287085273-750x375.webp'
  ];
  currentSlideIndex = 0;
  carouselPaused = false;
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  private homeScrollActive = false;
  private readonly onHomeScroll = () => {
    const hero = document.querySelector('.hero') as HTMLElement | null;
    const span = Math.max(hero?.offsetHeight ?? 480, 320);
    const progress = Math.min(1, Math.max(0, (window.scrollY - span * 0.2) / (span * 0.6)));
    document.documentElement.style.setProperty('--scroll-dark', progress.toFixed(3));
    const active = progress > 0.01;
    if (active !== this.homeScrollActive) {
      this.homeScrollActive = active;
      document.body.classList.toggle('home-scroll', active);
    }
  };
  private motionMedia?: MediaQueryList;
  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      this.carouselPaused = true;
      this.stopCarousel();
    }
  };

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
  private allMatches: Pet[] = [];
  hasMoreResults = false;

  // Modal for pet details
  showPetModal = false;
  selectedPet: Pet | null = null;

  // Matched pets will be loaded from service

  showcasedPets: Pet[] = [];
  depoimentos: UnifiedDepoimento[] = [];

  testimonials: Testimonial[] = [
    {
      text: 'A equipe do ThunderPets foi incrível! Encontrei meu melhor amigo, o Bob, e não poderia estar mais feliz. O processo de adoção foi super tranquilo e eles me deram todo o suporte necessário.',
      img: 'img/UPF-091817-NT-Cats-medium.jpg',
      name: 'Carlos Souza',
      info: 'Feliz tutor do Bob'
    },
    {
      text: 'Adotar a Luna foi a melhor decisão que já tomei. Ela trouxe muita alegria para minha casa. Agradeço ao ThunderPets por conectar nossas vidas e por todo o cuidado que tiveram.',
      img: 'img/why_life_is_better_with_dog_hero.jpg',
      name: 'Leonardo Silva',
      info: 'Feliz tutor da Luna'
    },
    {
      text: 'Obrigado, ThunderPets, por me ajudarem a encontrar o Thor! Ele é um cãozinho maravilhoso e cheio de energia. Recomendo a todos que queiram adotar um pet de forma responsável.',
      img: 'img/3DB8AACF00000578-0-image-a-73_1488153144705.jpg',
      name: 'Ana Pereira',
      info: 'Feliz tutora do Thor'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private petsService: PetsService,
    private router: Router,
    private depoimentoService: DepoimentoService,
    private adocaoService: AdocaoService
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

    this.motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (this.motionMedia.matches) {
      this.carouselPaused = true;
    }
    this.motionMedia.addEventListener('change', this.onMotionPreferenceChange);
    this.startCarousel();

    this.depoimentoService.depoimentos$.subscribe(depoimentos => {
      const depoimentosAprovados = depoimentos
        .filter(d => d.aprovado)
        .map(d => ({
          text: d.depoimento,
          name: d.nome,
          img: d.fotoUrl || 'assets/img/user-placeholder.png',
          info: 'Usuário verificado'
        }));

      const depoimentosEstaticos = this.testimonials.map(t => ({ ...t }));

      this.depoimentos = [...depoimentosEstaticos, ...depoimentosAprovados];
    });
  }

  ngAfterViewInit() {
    this.onHomeScroll();
    window.addEventListener('scroll', this.onHomeScroll, { passive: true });
  }

  ngOnDestroy() {
    this.stopCarousel();
    this.motionMedia?.removeEventListener('change', this.onMotionPreferenceChange);
    window.removeEventListener('scroll', this.onHomeScroll);
    document.body.classList.remove('home-scroll');
    document.documentElement.style.removeProperty('--scroll-dark');
  }

  startCarousel() {
    this.stopCarousel();
    if (this.carouselPaused) {
      return;
    }
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  toggleCarousel() {
    this.carouselPaused = !this.carouselPaused;
    if (this.carouselPaused) {
      this.stopCarousel();
      return;
    }
    this.startCarousel();
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
    this.allMatches = [];

    const formValue = this.matchingForm.value;
    const disponibilidadeSelecionada = this.disponibilidadeOptions
      .filter(opt => formValue[opt.value])
      .map(opt => opt.value);

    const userPreferences = {
      situacao: formValue.situacao,
      energia: formValue.energia,
      disponibilidade: disponibilidadeSelecionada
    };

    console.log('🎯 Buscando matches via API:', userPreferences);

    this.petsService.findTherapeuticMatches(userPreferences).subscribe({
      next: (matches: Pet[]) => {
        this.isMatching = false;
        this.showResults = true;
        this.allMatches = matches;
        this.matchedPets = matches.slice(0, 3);
        this.hasMoreResults = matches.length > 3;

        console.log(`💚 API: ${matches.length} pets compatíveis encontrados`);
      },
      error: (error: any) => {
        console.error('❌ Erro no matching via API:', error);
        this.isMatching = false;
        this.petsService.pets$.subscribe(allPets => {
          const disponiveis = allPets.filter((pet: Pet) => !pet.adotado);
          this.allMatches = disponiveis;
          this.matchedPets = disponiveis.slice(0, 3);
          this.hasMoreResults = disponiveis.length > 3;
          this.showResults = true;
          console.log('⚠️ Fallback: usando dados locais');
        }).unsubscribe();
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
      this.router.navigate(['/auth'], { queryParams: { returnUrl: this.router.url || '/' } });
      return;
    }

    console.log('✅ Usuário validado no home:', currentUser.nome, 'Role:', currentUser.role);

    this.adocaoService.novaSolicitacao(pet, currentUser);
    this.router.navigate([currentUser.role === 'mediador' ? '/painel-mediador' : '/painel-adotante']);

    // Opcional: fechar o modal se estiver aberto
    if (this.showPetModal) {
      this.closePetModal();
    }
  }

  onShowMoreResults() {
    const proximos = this.allMatches
      .filter(pet => !this.matchedPets.some(shown => shown.id === pet.id))
      .slice(0, 5);
    this.matchedPets = [...this.matchedPets, ...proximos];
    this.hasMoreResults = this.matchedPets.length < this.allMatches.length;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showPetModal) {
      this.closePetModal();
    }
  }

  getTopScores(pet: Pet): { label: string, value: number }[] {
    const formValue = this.matchingForm.value;
    const situacaoPrincipal = formValue.situacao;
    const energiaPrincipal = formValue.energia;

    const scores: { [key: string]: number } = {
      'Depressão': 40,
      'Ansiedade': 40,
      'Solidão': 40,
    };

    // Aumenta o score da situação principal selecionada
    if (situacaoPrincipal) {
      const situacaoLabel = this.getSituacaoLabel(situacaoPrincipal);
      if (scores.hasOwnProperty(situacaoLabel)) {
        scores[situacaoLabel] = Math.min(95, scores[situacaoLabel] + 50); // Aumenta 50, máximo 95
      }
    }

    // Ajusta scores com base na energia do pet
    if (pet.energia === 'calmo-caseiro') {
      scores['Ansiedade'] = Math.min(95, (scores['Ansiedade'] || 40) + 30);
    } else if (pet.energia === 'ativo-aventurado') {
      scores['Depressão'] = Math.min(95, (scores['Depressão'] || 40) + 30);
    } else {
      scores['Solidão'] = Math.min(95, (scores['Solidão'] || 40) + 20);
    }

    // Converte para o formato de array e ordena
    return Object.entries(scores)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }

  private getSituacaoLabel(situacaoValue: string): string {
    switch (situacaoValue) {
      case 'depressao': return 'Depressão';
      case 'ansiedade': return 'Ansiedade';
      case 'solidao': return 'Solidão';
      default: return '';
    }
  }

  // Método auxiliar para calcular idade formatada
  calcularIdade(idade: string | number): string {
    if (idade === null || idade === undefined) {
      return 'Idade não informada';
    }

    // Se a idade for um número ou uma string numérica, assumimos que são meses.
    if (typeof idade === 'number' || !isNaN(Number(idade))) {
      const idadeEmMeses = Number(idade);
      const anos = Math.floor(idadeEmMeses / 12);
      const meses = idadeEmMeses % 12;

      if (anos > 0 && meses > 0) {
        return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} mes${meses > 1 ? 'es' : ''}`;
      }
      if (anos > 0) {
        return `${anos} ano${anos > 1 ? 's' : ''}`;
      }
      if (meses > 0) {
        return `${meses} mes${meses > 1 ? 'es' : ''}`;
      }
      return 'Recém-nascido';
    }

    // Se for uma string de data (fallback)
    const nascimento = new Date(idade);
    if (isNaN(nascimento.getTime())) {
      return 'Idade não informada';
    }

    const hoje = new Date();
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
      anos--;
      meses += 12;
    }

    if (anos > 0) {
      return `${anos} ano${anos > 1 ? 's' : ''}`;
    } else {
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
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

  // Método para obter imagem local dos pets em destaque
  getLocalImage(pet: Pet): string {
    const imageMap: { [key: string]: string } = {
      'Caramelo': '/img/cachorro-caramelo-Petlove.jpg',
      'Thor': '/img/raca-de-cachorro-preto.jpg',
      'Luna': '/img/pexels-photo-2247894.jpeg',
      'Buddy': '/img/cachorro-_1750287085273-750x375.webp',
      'Sonecas': '/img/patas.png'
    };

    return imageMap[pet.nome] || pet.foto_url || '/img/pexels-photo-2247894.jpeg';
  }

  // Método para obter badge de terapia baseado na compatibilidade
  getTherapyBadge(pet: Pet): string {
    // Proteção contra compatibilidadeScore undefined ou propriedades individuais undefined
    const scoreDepressao = pet?.compatibilidadeScore?.depressao || 50;
    const scoreAnsiedade = pet?.compatibilidadeScore?.ansiedade || 50;
    const scoreSolidao = pet?.compatibilidadeScore?.solidao || 50;

    const maxScore = Math.max(scoreDepressao, scoreAnsiedade, scoreSolidao);

    if (maxScore >= 85) return 'badge-excelente';
    if (maxScore >= 70) return 'badge-bom';
    if (maxScore >= 50) return 'badge-medio';
    return 'badge-baixo';
  }

  // Método para obter label de terapia baseado na compatibilidade
  getTherapyLabel(pet: Pet): string {
    // Proteção contra compatibilidadeScore undefined ou propriedades individuais undefined
    const scoreDepressao = pet?.compatibilidadeScore?.depressao || 50;
    const scoreAnsiedade = pet?.compatibilidadeScore?.ansiedade || 50;
    const scoreSolidao = pet?.compatibilidadeScore?.solidao || 50;

    const maxScore = Math.max(scoreDepressao, scoreAnsiedade, scoreSolidao);

    if (maxScore >= 85) return 'Excelente Match';
    if (maxScore >= 70) return 'Bom Match';
    if (maxScore >= 50) return 'Match Médio';
    return 'Compatível';
  }

  // Método para solicitar adoção (similar ao adoptPet)
  requestAdoption(pet: Pet) {
    // Reutiliza a lógica principal de adoptPet para consistência
    this.adoptPet(pet);
  }
}
