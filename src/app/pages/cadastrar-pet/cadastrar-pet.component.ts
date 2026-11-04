import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PetsService } from '../../services/pets.service';
import { AuthService } from '../../services/auth.service';

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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  currentStep: number = 1;
  totalSteps: number = 3;
  usuarioAtual: any;
  selectedImages: string = '';
  isEditMode: boolean = false;
  editingPetId: number | null = null;
  pet: any = {};

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private petService: PetsService,
    private authService: AuthService
  ) {
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

      // Verificar se está em modo de edição
      this.route.queryParams.subscribe(params => {
        this.isEditMode = params['edit'] === 'true';
        this.editingPetId = params['id'] ? +params['id'] : null;

        if (this.isEditMode && this.editingPetId && this.usuarioAtual) {
          this.loadPetForEditing();
        }
      });
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
    const hasPhoto = this.selectedImages && this.selectedImages.trim() !== '';
    const allFieldsValid = step3Fields.every(field => this.petForm.get(field)?.valid === true);
    return Boolean(allFieldsValid && hasPhoto);
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

  // Converter idade automaticamente se > 12 meses
  private converterIdadeAutomaticamente(petData: PetData): PetData {
    if (petData.unidade_idade === 'meses' && petData.idade > 12) {
      const anosConvertidos = Math.floor(petData.idade / 12);
      console.log(`🔄 Convertendo ${petData.idade} meses para ${anosConvertidos} anos`);
      return {
        ...petData,
        idade: anosConvertidos,
        unidade_idade: 'anos'
      };
    }
    return petData;
  }

  // Salvar cadastro ou atualização
  async onSubmit(): Promise<void> {
    if (this.petForm.valid && this.usuarioAtual) {
      try {
        let petData: PetData = this.petForm.value;

        // Aplicar conversão automática de idade se necessário
        petData = this.converterIdadeAutomaticamente(petData);
        const petsExistentes = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');

        if (this.isEditMode && this.editingPetId) {
          // Atualizar pet existente
          const petIndex = petsExistentes.findIndex((p: any) => p.id === this.editingPetId);
          if (petIndex !== -1) {
            petsExistentes[petIndex] = {
              ...petsExistentes[petIndex],
              ...petData,
              foto: petData.fotos.length > 0 ? petData.fotos[0] : '/img/THUNDERPETS (4) (1).png'
            };
          }
        } else {
          // Adicionar novo pet
          petsExistentes.push({
            ...petData,
            foto: petData.fotos.length > 0 ? petData.fotos[0] : '/img/THUNDERPETS (4) (1).png',
            id: Date.now(),
            usuarioEmail: this.usuarioAtual.email,
            usuarioNome: this.usuarioAtual.nome,
            usuarioTipo: this.usuarioAtual.role,
            dataCadastro: new Date().toISOString(),
            status: 'disponivel'
          });
        }

        localStorage.setItem('petsCadastrados', JSON.stringify(petsExistentes));

        // Mostrar sucesso e redirecionar
        const message = this.isEditMode ? '✅ Pet atualizado com sucesso!' : '✅ Pet cadastrado com sucesso!';
        alert(message);

        this.voltarAoPainel();
      } catch (error) {
        alert('❌ Erro ao salvar pet. Tente novamente.');
      }
    } else {
      alert('❌ Preencha todos os campos obrigatórios corretamente.');
    }
  }

  // Progress indicator
  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  private voltarAoPainel(): void {
    this.router.navigate([this.authService.getPanelRoute(this.usuarioAtual?.role)]);
  }

  // Cancelar cadastro
  cancelCadastro(): void {
    const message = this.isEditMode ? 'cancelar a edição' : 'cancelar o cadastro';
    if (confirm(`Tem certeza que deseja ${message}? Os dados não salvos serão perdidos.`)) {
      this.voltarAoPainel();
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

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Comprimir para JPEG
        this.selectedImages = dataUrl;
        this.petForm.get('fotos')?.setValue([dataUrl]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImages = '';
    this.petForm.get('fotos')?.setValue([]);
  }

  // Carregar dados do pet para edição
  loadPetForEditing(): void {
    if (!this.editingPetId || !this.usuarioAtual) return;

    try {
      const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
      const pet = petsCadastrados.find((p: any) => p.id === this.editingPetId && p.usuarioEmail === this.usuarioAtual.email);

      if (pet) {
        // Preencher o formulário com os dados do pet
        this.petForm.patchValue({
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca,
          idade: pet.idade,
          unidade_idade: pet.unidade_idade,
          porte: pet.porte,
          genero: pet.genero,
          temperamento: pet.temperamento || [],
          vacinado: pet.vacinado || false,
          vermifugado: pet.vermifugado || false,
          castrado: pet.castrado || false,
          necessidades_especiais: pet.necessidades_especiais || '',
          energia: pet.energia,
          fotos: pet.fotos || [],
          descricao: pet.descricao,
          caracteristicas_positivas: pet.caracteristicas_positivas || '',
          localizacao: pet.localizacao,
          contato: pet.contato
        });

        // Se há fotos existentes, mostrar como selectedImages
        if (pet.fotos && pet.fotos.length > 0) {
          this.selectedImages = pet.fotos[0]; // Apenas a primeira imagem
        }
      } else {
        alert('Pet não encontrado ou você não tem permissão para editá-lo.');
        this.voltarAoPainel();
      }
    } catch (error) {
      console.error('Erro ao carregar pet para edição:', error);
      alert('Erro ao carregar dados do pet.');
      this.voltarAoPainel();
    }
  }
}
