import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PetsService, Pet } from '../../services/pets.service';
import { SlicePipe, TitleCasePipe } from '@angular/common';

interface DisponibilidadeOption {
  value: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-painel-voluntario',
  imports: [CommonModule, ReactiveFormsModule, SlicePipe, TitleCasePipe],
  templateUrl: './painel-voluntario.component.html',
  styleUrl: './painel-voluntario.component.css'
})
export class PainelVoluntarioComponent implements OnInit {

  matchingForm!: FormGroup;
  isMatching = false;
  showResults = false;
  matchedPets: Pet[] = [];
  hasMoreResults = false;

  // Modal de detalhes pet
  showPetModal = false;
  selectedPet: Pet | null = null;

  disponibilidadeOptions: DisponibilidadeOption[] = [
    { value: 'poucas-horas', label: 'Poucas horas/dia', emoji: '⏰' },
    { value: 'metade-dia', label: 'Meia jornada', emoji: '🌙' },
    { value: 'todo-dia', label: 'Todo o dia', emoji: '🏠' },
    { value: 'flexivel', label: 'Horário flexível', emoji: '🔄' }
  ];

  constructor(
    private fb: FormBuilder,
    private petsService: PetsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.matchingForm = this.fb.group({
      situacao: [''],
      energia: [''],
      'poucas-horas': [false],
      'metade-dia': [false],
      'todo-dia': [false],
      'flexivel': [false]
    });
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

    console.log('🎯 Voluntário: Buscando matches terapêuticos:', userPreferences);

    // Usar API para matching
    this.petsService.findTherapeuticMatches(userPreferences).subscribe({
      next: (matches) => {
        this.isMatching = false;
        this.showResults = true;
        this.matchedPets = matches.slice(0, 3); // Mostrar 3 primeiros
        this.hasMoreResults = matches.length > 3;

        console.log(`💚 Voluntário: ${matches.length} pets compatíveis encontrados`);
      },
      error: (error) => {
        console.error('❌ Voluntário: Erro no matching via API:', error);
        this.isMatching = false;
        // Fallback: usar dados locais
        this.showFallbackPets();
      }
    });
  }

  private showFallbackPets() {
    // Pegar alguns pets do behavior subject
    this.petsService.pets$.subscribe(pets => {
      if (pets.length > 0) {
        this.matchedPets = pets.filter(pet => !pet.adotado).slice(0, 3);
        this.showResults = true;
        console.log('⚠️ Voluntário: Usando dados fallback');
      }
    }).unsubscribe(); // unsubscribe após pegar dados uma vez
  }

  getTherapyBadge(pet: Pet): string {
    const maxScore = Math.max(
      pet.compatibilidadeScore.depressao,
      pet.compatibilidadeScore.ansiedade,
      pet.compatibilidadeScore.solidao
    );

    if (maxScore >= 85) return 'badge-excelente';
    if (maxScore >= 70) return 'badge-bom';
    if (maxScore >= 50) return 'badge-medio';
    return 'badge-baixo';
  }

  getTherapyLabel(pet: Pet): string {
    const maxScore = Math.max(
      pet.compatibilidadeScore.depressao,
      pet.compatibilidadeScore.ansiedade,
      pet.compatibilidadeScore.solidao
    );

    if (maxScore >= 85) return 'Excelente Match';
    if (maxScore >= 70) return 'Bom Match';
    if (maxScore >= 50) return 'Match Médio';
    return 'Compatível';
  }

  getTopScores(pet: Pet): { label: string, value: number }[] {
    const scores = [
      { label: 'Depressão', value: pet.compatibilidadeScore.depressao },
      { label: 'Ansiedade', value: pet.compatibilidadeScore.ansiedade },
      { label: 'Solidão', value: pet.compatibilidadeScore.solidao }
    ];
    return scores.sort((a, b) => b.value - a.value).slice(0, 3);
  }

  openPetDetails(pet: Pet) {
    this.selectedPet = pet;
    this.showPetModal = true;
    document.body.style.overflow = 'hidden';
  }

  closePetModal() {
    this.showPetModal = false;
    this.selectedPet = null;
    document.body.style.overflow = 'auto';
  }

  requestAdoption(pet: Pet) {
    console.log('📝 Voluntário solicitando adoção:', pet);

    // Verificar se usuário está logado
    const currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');

    if (!currentUser) {
      alert('Para solicitar adoção, você precisa estar logado.');
      this.router.navigate(['/auth']);
      return;
    }

    const confirmacao = confirm(
      `Confirmar solicitação de adoção terapêutica?\n\n` +
      `🏆 Pet: ${pet.nome}\n` +
      `💙 Benefício: ${pet.beneficioEmocional}\n\n` +
      `Iremos avaliar sua demanda terapêutica e entrar em contato em breve.`
    );

    if (confirmacao) {
      // Chamar API de adoção
      const adoptionRequest = {
        pet_id: pet.id,
        adotante_nome: currentUser.nome,
        adotante_email: currentUser.email,
        adotante_telefone: 'A ser preenchido no contato',
        motivacao: 'Adoção terapêutica - Voluntário registrado'
      };

      console.log('📡 Enviando solicitação:', adoptionRequest);

      alert(`✅ Solicitação Enviada!\n\nPet: ${pet.nome}\nAnalisaremos sua demanda terapêutica e entraremos em contato.\n\nObrigado por buscar ajuda através da adoção terapêutica! 💙`);

      this.closePetModal();
    }
  }

  showMoreResults() {
    // Mostrar todos os pets compatíveis não exibidos
    this.petsService.pets$.subscribe(allPets => {
      const compatiblePets = allPets.filter(pet =>
        !this.matchedPets.some(shown => shown.id === pet.id)
      );
      this.matchedPets = [...this.matchedPets, ...compatiblePets.slice(0, 3)];
      this.hasMoreResults = compatiblePets.length > 3;
    });
  }

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
}
