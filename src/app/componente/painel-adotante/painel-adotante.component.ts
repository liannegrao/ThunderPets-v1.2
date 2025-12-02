import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PetsService, Pet } from '../../services/pets.service';
import { AdocaoService, SolicitacaoAdocao } from '../../services/adocao.service';
import { SlicePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DisponibilidadeOption {
  value: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-painel-adotante',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SlicePipe, TitleCasePipe],
  templateUrl: './painel-adotante.component.html',
  styleUrl: './painel-adotante.component.css'
})
export class PainelAdotanteComponent implements OnInit {

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

  // Novas propriedades para a nova interface
  showMatching = false;
  filtroEspecie = '';
  filtroPorte = '';
  filtroEnergia = '';
  petsFiltrados: Pet[] = [];
  petsDisponiveis: Pet[] = [];
  isLoadingPets = true;

  // Propriedades para estatísticas (para evitar ExpressionChangedAfterItHasBeenCheckedError)
  totalPetsDisponiveis = 0;
  taxaSucesso = 75;
  totalAdocoes = 0;

  // Propriedades para edição de perfil
  showEditProfile = false;
  profileForm!: FormGroup;
  currentUser: any = null;
  selectedFile: File | null = null;

  // Novas propriedades para solicitações de adoção
  solicitacoes: SolicitacaoAdocao[] = [];
  stats = { pendentes: 0, aprovadas: 0, rejeitadas: 0 };

  constructor(
    private fb: FormBuilder,
    private petsService: PetsService,
    private router: Router,
    private adocaoService: AdocaoService
  ) {}

  ngOnInit() {
    this.initForm();
    this.initProfileForm();
    this.loadCurrentUser();
    this.carregarPetsDisponiveis();
    this.aplicarFiltros(); // Inicializa filtros
    this.carregarSolicitacoes(); // Carrega as solicitações de adoção
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

  private initProfileForm() {
    this.profileForm = this.fb.group({
      nome: [''],
      email: [''],
      telefone: ['']
    });
  }

  private loadCurrentUser() {
    try {
      this.currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');
      if (this.currentUser) {
        this.profileForm.patchValue({
          nome: this.currentUser.nome || '',
          email: this.currentUser.email || '',
          telefone: this.currentUser.telefone || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      this.currentUser = null;
    }
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
      next: (matches: Pet[]) => {
        this.isMatching = false;
        this.showResults = true;
        this.matchedPets = matches.slice(0, 3); // Mostrar 3 primeiros
        this.hasMoreResults = matches.length > 3;

        console.log(`💚 Voluntário: ${matches.length} pets compatíveis encontrados`);
      },
      error: (error: any) => {
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

  // Modal de confirmação de adoção
  showConfirmationModal = false;
  confirmationPet: Pet | null = null;

  requestAdoption(pet: Pet) {
    console.log('📝 Iniciando solicitação de adoção:', pet);

    // Verificar se usuário está logado
    const currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');

    console.log('👤 Usuário atual:', currentUser);

    // Se não tem usuário no localStorage, mostrar mensagem de login
    if (!currentUser || !currentUser.nome) {
      alert('Para solicitar adoção, você precisa estar logado. Redirecionando para login...');
      this.router.navigate(['/auth']);
      return;
    }

    console.log('✅ Usuário validado:', currentUser.nome, 'Role:', currentUser.role);

    // Definir o painel certo conforme o tipo de usuário
    const painel = currentUser.role === 'mediador' ? 'painel-mediador' : 'painel-adotante';

    // Mensagem correta
    const confirmacao = confirm(
      `Sua escolha do pet ${pet.nome} foi para seu painel. Depois o mediador vai ver, lá em Solicitações de Adoção Pendentes, o seu nome (${currentUser.nome}).`
    );

    if (confirmacao) {
      // Usar o AdocaoService para criar a solicitação
      this.adocaoService.novaSolicitacao(pet, currentUser);

      // Redirecionar para o painel
      this.router.navigate([`/${painel}`]);
    }
  }

  confirmAdoption() {
    if (!this.confirmationPet) return;

    const pet = this.confirmationPet;
    const currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');

    // Enviar solicitação para mediadores
    const adoptionRequest = {
      pet_id: pet.id,
      pet_nome: pet.nome,
      pet_raca: pet.raca,
      adotante_nome: currentUser.nome,
      adotante_email: currentUser.email,
      adotante_telefone: 'A ser preenchido no contato',
      motivacao: 'Adoção terapêutica - Benefício emocional solicitado',
      status: 'pendente_revisao',
      data_solicitacao: new Date().toISOString(),
      tipo_usuario: currentUser.role || 'adotante',
      scores_compatibilidade: pet.compatibilidadeScore
    };

    console.log('📡 Enviando solicitação para mediadores:', adoptionRequest);

    // Aqui você pode adicionar a chamada para a API dos mediadores
    // Por exemplo: this.mediatorService.submitAdoptionRequest(adoptionRequest);

    // Fechar modais
    this.showConfirmationModal = false;
    this.showPetModal = false;
    this.confirmationPet = null;

    // Redirect baseado no tipo de usuário
    if (currentUser.role === 'mediador') {
      // Mediadores vão para seu painel para ver solicitações
      alert(`✅ Solicitação enviada!\n\nComo mediador, você pode revisar esta e outras solicitações no seu painel administrativo.`);
      this.router.navigate(['/painel-mediador']);
    } else {
      // Usuários comuns têm confirmação
      alert(`✅ Solicitação Enviada com Sucesso!\n\nPet: ${pet.nome}\n\nEm breve um mediador entrará em contato para avaliar sua solicitação e confirmar a adoção terapêutica.\n\nObrigado por buscar ajuda através da adoção terapêutica! 💙`);

      // Voltar para a seção de adoção
      setTimeout(() => {
        const adoptionSection = document.getElementById('adote');
        if (adoptionSection) {
          adoptionSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }

  cancelAdoption() {
    this.showConfirmationModal = false;
    this.confirmationPet = null;
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

  // Novo método para o matching expandible
  toggleMatching() {
    this.showMatching = !this.showMatching;
  }

  // Carregar pets disponíveis para adoção
  carregarPetsDisponiveis() {
    this.isLoadingPets = true;

    // Combinar pets da API + pets dos doadores
    this.petsService.pets$.subscribe(petsDaAPI => {
      let todosPets: Pet[] = [...petsDaAPI];

      // Adicionar pets cadastrados pelos doadores (localStorage)
      try {
        const petsDosDoadores = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
        const petsCadastrados = petsDosDoadores
          .filter((pet: any) => pet.status === 'disponivel' || pet.status === 'aprovado')
          .map((pet: any) => ({
            id: pet.id,
            nome: pet.nome,
            especie: pet.especie,
            raca: pet.raca,
            idade: pet.idade,
            porte: pet.porte,
            energia: pet.energia || 'medio',
            adotado: pet.status === 'adotado',
            foto: pet.foto_url || pet.foto || '/img/THUNDERPETS (4) (1).png', // Priorizar foto_url
            foto_url: pet.foto_url, // URL do Cloudinary se disponível
            beneficioEmocional: pet.caracteristicas_positivas || 'Companheiro terapêutico',
            personalidade: pet.descricao,
            saude: 'Boa saúde',
            cuidados: 'Cuidados básicos',
            casaIdeal: pet.localizacao,
            historia: pet.descricao,
            compatibilidadeScore: { depressao: 70, ansiedade: 65, solidao: 75 }
          } as Pet));

        todosPets = [...todosPets, ...petsCadastrados];
      } catch (error) {
        console.error('Erro ao carregar pets doadores:', error);
      }

      this.petsDisponiveis = todosPets.filter(pet => !pet.adotado).map(pet => {
        if (pet.nome === 'Sonecas') {
          pet.foto = '/img/cut cat serhio 02-1813x1811-720x719.jpg';
        }
        if (pet.nome === 'Purês') {
          pet.foto = '/img/premium_photo-1673967831980-1d377baaded2.jpg';
          pet.foto_url = ''; // Limpar a foto_url para evitar duplicatas
        }
        return pet;
      });
      this.totalPetsDisponiveis = this.petsDisponiveis.length; // Atualizar propriedade para estatísticas
      this.isLoadingPets = false;
      this.aplicarFiltros();

      // console.log(`🐾 ${todosPets.length} pets disponíveis carregados`);

    });
  }

  // Aplicar filtros aos pets disponíveis
  aplicarFiltros() {
    let filtrados = [...this.petsDisponiveis];

    if (this.filtroEspecie) {
      if (this.filtroEspecie === 'outros') {
        filtrados = filtrados.filter(pet => pet.especie !== 'cachorro' && pet.especie !== 'gato');
      } else {
        filtrados = filtrados.filter(pet => pet.especie === this.filtroEspecie);
      }
    }

    if (this.filtroPorte) {
      filtrados = filtrados.filter(pet => pet.porte === this.filtroPorte);
    }

    if (this.filtroEnergia) {
      const energiaMap: Record<string, string[]> = {
        baixo: ['calmo-caseiro', 'baixo', 'calmo'],
        medio: ['moderado', 'medio'],
        alto: ['alto', 'hiperativo']
      };
      const valoresAceitos = energiaMap[this.filtroEnergia] || [this.filtroEnergia];
      filtrados = filtrados.filter(pet => valoresAceitos.includes(String(pet.energia)));
    }

    // Ordenar por data de cadastro (mais recentes primeiro)
    filtrados.sort((a, b) => {
      // Para pets sem ID de data, usar o ID para ordenar
      return b.id - a.id;
    });

    this.petsFiltrados = filtrados;
    // console.log(`🔍 Filtros aplicados: ${filtrados.length} pets mostrados`);

  }

  // Limpar todos os filtros
  limparFiltros() {
    this.filtroEspecie = '';
    this.filtroPorte = '';
    this.filtroEnergia = '';
    this.aplicarFiltros();
  }

  // TrackBy function for ngFor optimization
  trackByPet(index: number, pet: Pet): any {
    return pet.id;
  }

  // Carrega as solicitações de adoção do usuário logado
  carregarSolicitacoes() {
    if (!this.currentUser) return;

    this.adocaoService.getSolicitacoesPorUsuario(this.currentUser.email).subscribe((solicitacoes: SolicitacaoAdocao[]) => {
      this.solicitacoes = solicitacoes;
      this.atualizarEstatisticas();
      console.log('Solicitações carregadas:', this.solicitacoes);
    });
  }

  // Atualiza as estatísticas com base nas solicitações carregadas
  atualizarEstatisticas() {
    this.stats.pendentes = this.solicitacoes.filter(s => s.status === 'pendente').length;
    this.stats.aprovadas = this.solicitacoes.filter(s => s.status === 'aprovada').length;
    this.stats.rejeitadas = this.solicitacoes.filter(s => s.status === 'rejeitada').length;
  }

  limparHistorico() {
    if (this.currentUser && confirm('Tem certeza que deseja limpar o histórico de solicitações aprovadas e rejeitadas?')) {
      this.adocaoService.limparHistoricoSolicitacoes(this.currentUser.email);
    }
  }

  // Estatísticas gerais
  getTotalPetsDisponiveis(): number {
    return this.petsDisponiveis.length;
  }

  getTaxaSucesso(): number {
    // Simulação de taxa de adoção bem-sucedida
    return 75;
  }

  getTotalAdocoes(): number {
    // Simulação de total de adoções realizadas
    const petsAdotados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]')
      .filter((pet: any) => pet.status === 'adotado');

    return petsAdotados.length + Math.floor(Math.random() * 50); // Simulação
  }

  // Verificar se usuário é mediador (para mostrar botão de exclusão)
  isUserMediator(): boolean {
    try {
      const currentUser = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');
      return currentUser?.role === 'mediador';
    } catch {
      return false;
    }
  }

  // Excluir pet (apenas para mediadores)
  excluirPet(event: Event, pet: Pet): void {
    event.stopPropagation(); // Impedir que o clique no botão abra o modal

    if (!this.isUserMediator()) {
      alert('❌ Você não tem permissão para excluir pets.');
      return;
    }

    // Verificar se é um pet da API (IDs pequenos) ou cadastrado (IDs grandes)
    const isApiPet = pet.id < 100; // IDs da API são pequenos (1, 2, 3...), cadastrados usam Date.now()

    let confirmMessage = `🗑️ Tem certeza que deseja excluir "${pet.nome}"?\n\n`;
    if (isApiPet) {
      confirmMessage += 'Este é um pet da base de dados principal. A exclusão será apenas visual (não afeta o banco de dados real).\n\n';
    } else {
      confirmMessage += 'Esta ação não pode ser desfeita e o pet será removido permanentemente do sistema.\n\n';
    }
    confirmMessage += 'Deseja continuar?';

    const confirmacao = confirm(confirmMessage);

    if (!confirmacao) return;

    try {
      if (isApiPet) {
        // Para pets da API: apenas remover da lista local (não afeta banco de dados)
        this.petsDisponiveis = this.petsDisponiveis.filter(p => p.id !== pet.id);
        this.aplicarFiltros();
        console.log(`✅ Pet da API "${pet.nome}" removido da visualização`);
        alert(`✅ "${pet.nome}" foi removido da lista de pets disponíveis (exclusão visual apenas).`);
      } else {
        // Para pets cadastrados: remover do localStorage
        const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
        const petIndex = petsCadastrados.findIndex((p: any) => p.id === pet.id);

        if (petIndex !== -1) {
          petsCadastrados.splice(petIndex, 1);
          localStorage.setItem('petsCadastrados', JSON.stringify(petsCadastrados));

          // Atualizar listas locais
          this.petsDisponiveis = this.petsDisponiveis.filter(p => p.id !== pet.id);
          this.aplicarFiltros();

          console.log(`✅ Pet "${pet.nome}" excluído pelo mediador`);
          alert(`✅ "${pet.nome}" foi excluído com sucesso do sistema.`);
        } else {
          alert('❌ Pet não encontrado no sistema.');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      alert('❌ Erro ao excluir pet. Tente novamente.');
    }
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

  // Verificar se usuário está logado
  isUserLoggedIn(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('thunderpets_logged_user') || 'null');
      return user && user.nome;
    } catch {
      return false;
    }
  }

  // Alternar modo de edição de perfil
  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
    if (!this.showEditProfile) {
      // Se cancelando edição, recarregar dados do usuário
      this.loadCurrentUser();
    }
  }

  // Salvar alterações do perfil
  salvarPerfil(): void {
    if (this.profileForm.invalid) {
      alert('❌ Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    try {
      const formValue = this.profileForm.value;
      const updatedUser = {
        ...this.currentUser,
        nome: formValue.nome,
        email: formValue.email,
        telefone: formValue.telefone
      };

      // O upload será tratado por um serviço
      if (this.selectedFile) {
        // Simular o upload e obter uma URL
        // Em um app real, você chamaria this.authService.uploadProfilePic(this.selectedFile)
        const fakeUrl = URL.createObjectURL(this.selectedFile);
        updatedUser.foto = fakeUrl; // Usar a URL temporária como foto
        this.saveUserToStorage(updatedUser);

      } else {
        this.saveUserToStorage(updatedUser);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('❌ Erro ao salvar alterações. Tente novamente.');
    }
  }

  private saveUserToStorage(user: any): void {
    localStorage.setItem('thunderpets_logged_user', JSON.stringify(user));
    this.currentUser = user;
    this.showEditProfile = false;
    alert('✅ Perfil atualizado com sucesso!');
  }

  // Manipular seleção de arquivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ A imagem deve ter no máximo 5MB.');
        return;
      }

      // Verificar tipo
      if (!file.type.startsWith('image/')) {
        alert('❌ Selecione apenas arquivos de imagem.');
        return;
      }

      this.selectedFile = file;
    }
  }
}
