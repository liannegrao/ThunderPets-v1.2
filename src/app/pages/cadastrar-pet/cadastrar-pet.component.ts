import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface PetData {
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  unidade_idade: 'meses' | 'anos';
  porte: 'pequeno' | 'medio' | 'grande';
  genero: 'macho' | 'femea';

  // Etapa 2
  temperamento: string[];
  vacinado: boolean;
  vermifugado: boolean;
  castrado: boolean;
  necessidades_especiais: string;
  energia: 'baixo' | 'medio' | 'alto';

  // Etapa 3
  fotos: string[];
  descricao: string;
  caracteristicas_positivas: string;
  localizacao: string;
  contato: string;
}

@Component({
  selector: 'app-cadastrar-pet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastrar-pet.component.html',
  styleUrl: './cadastrar-pet.component.css'
})
export class CadastrarPetComponent implements OnInit {

  currentStep: number = 1;
  totalSteps: number = 3;
  usuarioAtual: any;

  petForm: FormGroup;
  temperamentosDisponiveis: string[] = [
    'Dócil', 'Brincalhão', 'Carinhoso', 'Sociável', 'Calmo',
    'Ativo', 'Fiel', 'Inteligente', 'Obediente', 'Energético'
  ];

  portesDisponiveis = [
    { value: 'pequeno', label: 'Pequeno (até 10kg)', icon: '🐕' },
    { value: 'medio', label: 'Médio (10-25kg)', icon: '🐕‍🦺' },
    { value: 'grande', label: 'Grande (acima de 25kg)', icon: '🐶' }
  ];

  especiesDisponiveis = [
    { value: 'cachorro', label: 'Cachorro', icon: '🐕' },
    { value: 'gato', label: 'Gato', icon: '🐱' },
    { value: 'outros', label: 'Outros', icon: '🐾' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.createPetForm();
  }

  ngOnInit(): void {
    // Buscar usuário LOGADO (não usuários cadastrados no sistema)
    const usuarioLogadoStr = localStorage.getItem('thunderpets_logged_user');
    if (!usuarioLogadoStr) {
      this.router.navigate([''], { queryParams: { login: 'required' } });
      return;
    }

    // Recuperar dados do usuário logado
    try {
      this.usuarioAtual = JSON.parse(usuarioLogadoStr);
      console.log('🐕 Usuário logado para cadastrar pet:', this.usuarioAtual);
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      this.router.navigate([''], { queryParams: { login: 'required' } });
    }
  }

  createPetForm(): FormGroup {
    return this.fb.group({
      // Etapa 1: Dados Básicos
      nome: ['', [Validators.required, Validators.minLength(2)]],
      especie: ['cachorro', Validators.required],
      raca: ['', Validators.required],
      idade: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      unidade_idade: ['meses', Validators.required],
      porte: ['medio', Validators.required],
      genero: ['macho', Validators.required],

      // Etapa 2: Saúde e Características
      temperamento: [[]],
      vacinado: [false],
      vermifugado: [false],
      castrado: [false],
      necessidades_especiais: [''],
      energia: ['medio', Validators.required],

      // Etapa 3: Fotos e Descrição
      fotos: [[]],
      descricao: ['', [Validators.required, Validators.minLength(20)]],
      caracteristicas_positivas: [''],
      localizacao: ['', Validators.required],
      contato: ['', [Validators.required, Validators.pattern(/^(\(\d{2}\)\s?\d{4,5}-\d{4}|\d{10,11})$/)]]
    });
  }

  // Navegação entre steps
  nextStep(): void {
    if (this.canProceed()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Validação por etapa
  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return this.isStep2Valid();
      case 3:
        return this.isStep3Valid();
      default:
        return false;
    }
  }

  isStep1Valid(): boolean {
    const step1Fields = ['nome', 'especie', 'raca', 'idade', 'unidade_idade', 'porte', 'genero'];
    return step1Fields.every(field => this.petForm.get(field)?.valid);
  }

  isStep2Valid(): boolean {
    // Etapa 2 é opcional, sempre pode prosseguir
    return true;
  }

  isStep3Valid(): boolean {
    const step3Fields = ['descricao', 'localizacao', 'contato'];
    return step3Fields.every(field => this.petForm.get(field)?.valid);
  }

  // Toggle temperamento
  toggleTemperamento(temperamento: string): void {
    const currentTemperamentos = this.petForm.get('temperamento')?.value || [];
    const index = currentTemperamentos.indexOf(temperamento);

    if (index > -1) {
      currentTemperamentos.splice(index, 1);
    } else {
      currentTemperamentos.push(temperamento);
    }

    this.petForm.get('temperamento')?.setValue(currentTemperamentos);
  }

  isTemperamentoSelected(temperamento: string): boolean {
    const current = this.petForm.get('temperamento')?.value || [];
    return current.includes(temperamento);
  }

  // Salvar cadastro
  async onSubmit(): Promise<void> {
    if (this.petForm.valid && this.usuarioAtual) {
      try {
        const petData: PetData = this.petForm.value;

        // Salvar no localStorage (por hora)
        const petsExistentes = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
        petsExistentes.push({
          ...petData,
          id: Date.now(),
          usuarioEmail: this.usuarioAtual.email,
          usuarioNome: this.usuarioAtual.nome,
          usuarioTipo: this.usuarioAtual.role,
          dataCadastro: new Date().toISOString(),
          status: 'disponivel'
        });

        localStorage.setItem('petsCadastrados', JSON.stringify(petsExistentes));

        // Mostrar sucesso e redirecionar
        alert('✅ Pet cadastrado com sucesso!');

        // Redirecionar baseado no tipo do usuário
        if (this.usuarioAtual.role === 'mediador') {
          this.router.navigate(['/painel-mediador']);
        } else if (this.usuarioAtual.role === 'doador') {
          this.router.navigate(['/painel-doador']); // Volta para o painel do doador
        } else {
          this.router.navigate(['/painel-adotante']);
        }
      } catch (error) {
        alert('❌ Erro ao cadastrar pet. Tente novamente.');
      }
    } else {
      alert('❌ Preencha todos os campos obrigatórios corretamente.');
    }
  }

  // Progress indicator
  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  // Cancelar cadastro
  cancelCadastro(): void {
    if (confirm('Tem certeza que deseja cancelar o cadastro? Os dados não salvos serão perdidos.')) {
      this.router.navigate(['/']);
    }
  }

  // Getters para validação de campos
  getFieldError(fieldName: string): string {
    const field = this.petForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato de telefone inválido';
      }
    }
    return '';
  }

  // Label formatting
  getIdadeLabel(): string {
    const unidade = this.petForm.get('unidade_idade')?.value;
    return unidade === 'meses' ? 'meses' : 'anos';
  }

  getPorteIcon(): string {
    const porte = this.petForm.get('porte')?.value;
    return this.portesDisponiveis.find(p => p.value === porte)?.icon || '🐕';
  }

  getEspecieIcon(): string {
    const especie = this.petForm.get('especie')?.value;
    return this.especiesDisponiveis.find(e => e.value === especie)?.icon || '🐾';
  }
}
