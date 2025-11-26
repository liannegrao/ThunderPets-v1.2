import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface DoacaoTerapeutica {
  motivacao: {
    depressao: boolean;
    ansiedade: boolean;
    solidao: boolean;
    mudanca: boolean;
    terapia: boolean;
    documentoSuporte: string;
  };
  petPreferencias: {
    cachorro: boolean;
    gato: boolean;
    qualquer: boolean;
    porte: string;
    energia: string;
    idoso: boolean;
  };
  informacoesPessoais: {
    nome: string;
    idade: number;
    localizacao: string;
    situacaoAtual: string;
    experientiaRelacionamento: string;
  };
  contato: {
    email: string;
    telefone: string;
    emergencia: string;
  };
  compromisso: {
    cuidados: boolean;
    tratamentoVeterinario: boolean;
    visitasMediador: boolean;
    acompanhamento: boolean;
  };
  observacoes: string;
  urgencia: 'baixa' | 'media' | 'alta';
}

@Component({
  selector: 'app-doar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doar.component.html',
  styleUrl: './doar.component.css'
})
export class DoarComponent implements OnInit {

  doarForm!: FormGroup;
  tiposCuidadosDisponiveis: string[] = [
    'Hospedagem (inteira)',
    'Hospedagem (diária)',
    'Passeio diário',
    'Cuidado médico',
    'Socialização',
    'Somente fim de semana',
    'Apoio psicológico'
  ];

  especiesDisponiveis = [
    { value: 'cachorro', label: 'Cachorro', icon: '🐕' },
    { value: 'gato', label: 'Gato', icon: '🐱' },
    { value: 'qualquer', label: 'Qualquer', icon: '🐾' }
  ];

  portesDisponiveis = [
    { value: 'pequeno', label: 'Pequeno', icon: '🐕' },
    { value: 'medio', label: 'Médio', icon: '🐕‍🦺' },
    { value: 'grande', label: 'Grande', icon: '🐶' },
    { value: 'qualquer', label: 'Qualquer', icon: '🐾' }
  ];

  energiaDisponivel = [
    { value: 'calmo', label: 'Calmo/Precisa repouso', icon: '😴' },
    { value: 'medio', label: 'Moderado', icon: '😐' },
    { value: 'ativo', label: 'Ativo/Precisa exercício', icon: '⚡' },
    { value: 'qualquer', label: 'Qualquer nível', icon: '🔄' }
  ];

  urgenciaDisponivel = [
    { value: 'baixa', label: 'Pouco Urgente', color: 'var(--color-teal-200)' },
    { value: 'media', label: 'Moderada', color: 'var(--color-yellow-200)' },
    { value: 'alta', label: 'Muito Urgente', color: 'var(--color-red-200)' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.doarForm = this.createDoacaoForm();
  }

  ngOnInit() {}

  // Getter defensivo para garantir que o formulário esteja sempre disponível
  get form() {
    if (!this.doarForm) {
      this.doarForm = this.createDoacaoForm();
    }
    return this.doarForm;
  }

  createDoacaoForm(): FormGroup {
    return this.fb.group({
      // Motivação emocional
      motivacao: this.fb.group({
        depressao: [false],
        ansiedade: [false],
        solidao: [false],
        mudanca: [false],
        terapia: [false],
        documentoSuporte: ['']
      }),

      // Preferências do pet terapêutico
      petPreferencias: this.fb.group({
        cachorro: [false],
        gato: [false],
        qualquer: [true],
        porte: ['qualquer'],
        energia: ['qualquer'],
        idoso: [false]
      }),

      // Informações pessoais
      informacoesPessoais: this.fb.group({
        nome: ['', Validators.required],
        idade: ['', [Validators.required, Validators.min(18)]],
        localizacao: ['', Validators.required],
        situacaoAtual: ['', Validators.required],
        experienciaRelacionamento: ['']
      }),

      // Contato
      contato: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required, Validators.pattern(/^(\(\d{2}\)\s?\d{4,5}-\d{4}|\d{10,11})$/)]],
        emergencia: ['']
      }),

      // Compromissos
      compromisso: this.fb.group({
        cuidados: [false, Validators.requiredTrue],
        tratamentoVeterinario: [false, Validators.requiredTrue],
        visitasMediador: [false],
        acompanhamento: [false, Validators.requiredTrue]
      }),

      observacoes: [''],
      urgencia: ['media']
    });
  }

  toggleMotivacao(motivacao: string): void {
    const currentValue = this.doarForm.get(`motivacao.${motivacao}`)?.value;
    this.doarForm.get(`motivacao.${motivacao}`)?.setValue(!currentValue);
  }

  isMotivacaoSelected(motivacao: string): boolean {
    return this.doarForm.get(`motivacao.${motivacao}`)?.value || false;
  }

  togglePetEspecie(especie: string): void {
    if (especie === 'qualquer') {
      // Se selecionar "qualquer", desmarca as outras
      this.doarForm.get('petPreferencias')?.patchValue({
        cachorro: false,
        gato: false,
        qualquer: true
      });
    } else {
      // Se selecionar cachorro ou gato, desmarca "qualquer"
      const cachorro = especie === 'cachorro' ? !this.doarForm.get(`petPreferencias.cachorro`)?.value : this.doarForm.get(`petPreferencias.cachorro`)?.value;
      const gato = especie === 'gato' ? !this.doarForm.get(`petPreferencias.gato`)?.value : this.doarForm.get(`petPreferencias.gato`)?.value;
      this.doarForm.get('petPreferencias')?.patchValue({
        cachorro: cachorro,
        gato: gato,
        qualquer: !cachorro && !gato
      });
    }
  }

  isEspecieSelecionada(especie: string): boolean {
    return this.doarForm.get(`petPreferencias.${especie}`)?.value || false;
  }

  // Submit do formulário
  onSubmit(): void {
    if (this.doarForm.valid) {
      console.log('Dados da doação terapêutica:', this.doarForm.value);

      // Por enquanto, apenas mostrar no console
      // TODO: Implementar lógica para salvar no backend/localStorage
      alert('✅ Solicitação de adoção terapêutica registrada!\n\nEntraremos em contato em breve para iniciar o processo de avaliação e matching com pets disponíveis.');
      this.router.navigate(['/']);
    } else {
      alert('❌ Preencha todos os campos obrigatórios corretamente.');
      this.markFormGroupTouched(this.doarForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Cancelar
  cancelar(): void {
    if (confirm('Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.')) {
      this.router.navigate(['/']);
    }
  }

  // Voltar ao início
  voltarAoInicio(): void {
    this.router.navigate(['/']);
  }

  // Validations
  getFieldError(fieldName: string): string {
    const field = this.doarForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} é obrigatório`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido de telefone';
      }
    }
    return '';
  }

  // Getters
  getEspecieIcon(): string {
    const especie = this.doarForm.get('especie')?.value;
    return this.especiesDisponiveis.find(e => e.value === especie)?.icon || '🐾';
  }

  getPorteIcon(): string {
    const porte = this.doarForm.get('porte')?.value;
    return this.portesDisponiveis.find(p => p.value === porte)?.icon || '🐾';
  }

  getEnergiaIcon(): string {
    const energia = this.doarForm.get('energia')?.value;
    return this.energiaDisponivel.find(e => e.value === energia)?.icon || '🐾';
  }

  getUrgenciaColor(): string {
    const urgencia = this.doarForm.get('urgencia')?.value;
    return this.urgenciaDisponivel.find(u => u.value === urgencia)?.color || 'var(--color-yellow-200)';
  }
}
