import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Usuario } from '../../services/auth.service';
import { PetsService, Pet } from '../../services/pets.service';
import { DepoimentoService, Depoimento } from '../../services/depoimento.service';
import { AdocaoService, SolicitacaoAdocao } from '../../services/adocao.service';
import { Router } from '@angular/router';

interface Estatistica {
  titulo: string;
  valor: string | number;
  icone: string;
  cor: string;
}

interface PetComDoador extends Pet {
  doador?: Usuario;
  dataCadastro?: Date;
  status: 'pendente' | 'aprovado' | 'adotado';
  foto_url?: string; // Adicionar foto_url
}

@Component({
  selector: 'app-painel-mediador',
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-mediador.component.html',
  styleUrl: './painel-mediador.component.css'
})
export class PainelMediadorComponent implements OnInit {

  private authService = inject(AuthService);
  private petsService = inject(PetsService);
  private depoimentoService = inject(DepoimentoService);
  private adocaoService = inject(AdocaoService);
  private router = inject(Router);

  currentUser?: Usuario;
  pets: PetComDoador[] = [];
  usuarios: Usuario[] = [];
  depoimentos: Depoimento[] = [];
  solicitacoesAdocao: SolicitacaoAdocao[] = [];
  activeTab: 'dashboard' | 'pets' | 'usuarios' | 'depoimentos' | 'relatorios' | 'solicitacoes-adocao' = 'dashboard';

  estatisticas: Estatistica[] = [
    {
      titulo: 'Pets Cadastrados',
      valor: 0,
      icone: '🐾',
      cor: 'var(--color-primary)'
    },
    {
      titulo: 'Usuários Ativos',
      valor: 0,
      icone: '👥',
      cor: 'var(--color-accent)'
    },
    {
      titulo: 'Adoções Realizadas',
      valor: 0,
      icone: '❤️',
      cor: 'var(--color-success)'
    },
    {
      titulo: 'Taxa de Sucesso',
      valor: '0%',
      icone: '📈',
      cor: 'var(--color-warning)'
    }
  ];

  // Dados simulados para demonstração
  usuariosSimulados: Usuario[] = [
    { email: 'ana.santos@email.com', nome: 'Ana Santos', role: 'doador', createdAt: '2024-11-01T10:00:00Z' },
    { email: 'carlos.silva@email.com', nome: 'Carlos Silva', role: 'doador', createdAt: '2024-11-02T14:30:00Z' },
    { email: 'mariana.costa@email.com', nome: 'Mariana Costa', role: 'voluntario', createdAt: '2024-10-28T09:15:00Z' },
    { email: 'ricardo.almeida@email.com', nome: 'Ricardo Almeida', role: 'mediador', createdAt: '2024-10-15T16:45:00Z' }
  ];

  ngOnInit() {
    this.loadCurrentUser();
    this.loadPets();
    this.loadUsuarios();
    this.loadDepoimentos();
    this.atualizarEstatisticas();
  }

  private loadDepoimentos() {
    this.depoimentoService.depoimentos$.subscribe(depoimentos => {
      this.depoimentos = depoimentos;
    });

    // Carregar solicitações de adoção do localStorage
    const solicitacoes = JSON.parse(localStorage.getItem('adocaoSolicitations') || '[]');
    this.solicitacoesAdocao = solicitacoes.filter((s: SolicitacaoAdocao) => s.status === 'pendente');
  }

  private loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;
    });
  }

  private loadPets() {
    // Carregar pets da API
    this.petsService.pets$.subscribe(petsOriginais => {
      let todosPets: PetComDoador[] = [];

      // Mapear pets da API (simulados)
      const petsDaAPI = petsOriginais.map((pet: Pet, index: number) => ({
        ...pet,
        doador: this.usuariosSimulados[index % this.usuariosSimulados.length],
        dataCadastro: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: pet.adotado ? 'adotado' : (Math.random() > 0.7 ? 'pendente' : 'aprovado') as 'pendente' | 'aprovado' | 'adotado'
      }));

      todosPets = todosPets.concat(petsDaAPI);

      // Carregar pets cadastrados pelos doadores (localStorage)
      try {
        const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');

        const petsDosDoadores = petsCadastrados.map((pet: any) => ({
          id: pet.id,
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca,
          idade: pet.idade,
          porte: pet.porte,
          energia: 'moderado', // Valor padrão
          adotado: pet.status === 'adotado',
          foto: pet.foto || '/img/THUNDERPETS (4) (1).png',
          foto_url: pet.foto_url, // URL do Cloudinary se disponível
          beneficioEmocional: pet.caracteristicas_positivas || 'Companheiro terapêutico',
          personalidade: pet.descricao,
          saude: 'Boa saúde', // Valor padrão
          cuidados: 'Cuidados básicos', // Valor padrão
          casaIdeal: pet.localizacao,
          historia: 'Pet cadastrado na plataforma',
          compatibilidadeScore: { depressao: 70, ansiedade: 65, solidao: 75 }, // Score padrão

          // Campos do mediador
          doador: { nome: pet.usuarioNome, email: pet.usuarioEmail, role: pet.usuarioTipo },
          dataCadastro: new Date(pet.dataCadastro),
          status: pet.status === 'adotado' ? 'adotado' :
                  (pet.status === 'disponivel' ? 'aprovado' : 'pendente') as 'pendente' | 'aprovado' | 'adotado'
        } as PetComDoador));

        todosPets = todosPets.concat(petsDosDoadores);

      } catch (error) {
        console.error('Erro carregando pets dos doadores:', error);
      }

      this.pets = todosPets;
      console.log('🐾 Todos os pets carregados no painel mediador:', this.pets.length, 'pets');
      this.atualizarEstatisticas();
    });
  }

  private loadUsuarios() {
    try {
      const cadastrados = this.authService.getAllUsers();
      // Se não houver nenhum cadastrado, usar simulados como fallback
      this.usuarios = cadastrados && cadastrados.length ? cadastrados : this.usuariosSimulados;
    } catch (e) {
      this.usuarios = this.usuariosSimulados;
    }
  }

  private atualizarEstatisticas() {
    this.estatisticas[0].valor = this.pets.length;
    this.estatisticas[1].valor = this.usuarios.length;
    this.estatisticas[2].valor = this.pets.filter(p => p.adotado).length;
    const taxaSucesso = this.pets.length > 0 ? Math.round((this.pets.filter(p => p.adotado).length / this.pets.length) * 100) : 0;
    this.estatisticas[3].valor = `${taxaSucesso}%`;
  }

  getPetsPorStatus(status: string): PetComDoador[] {
    switch(status) {
      case 'pendente':
        return this.pets.filter(p => p.status === 'pendente');
      case 'aprovado':
        return this.pets.filter(p => p.status === 'aprovado' && !p.adotado);
      case 'adotado':
        return this.pets.filter(p => p.adotado);
      default:
        return this.pets;
    }
  }

  getUsuariosPorRole(role: string): Usuario[] {
    return this.usuarios.filter(u => u.role === role);
  }

  getRoleLabel(role: string): string {
    switch(role) {
      case 'mediador': return 'Mediador';
      case 'voluntario': return 'Voluntário';
      case 'doador': return 'Doador';
      case 'comum': return 'Usuário Comum';
      default: return 'Usuário';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'aprovado': return 'Aprovado';
      case 'adotado': return 'Adotado';
      default: return 'Indefinido';
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'pendente': return '#f59e0b';
      case 'aprovado': return '#10b981';
      case 'adotado': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  aprovarPet(pet: PetComDoador) {
    pet.status = 'aprovado';
    console.log('Pet aprovado:', pet);
  }

  rejeitarPet(pet: PetComDoador) {
    // Simular remoção do sistema
    this.pets = this.pets.filter(p => p.id !== pet.id);
    console.log('Pet rejeitado:', pet);
  }

  marcarComoAdotado(pet: PetComDoador) {
    pet.adotado = true;
    pet.status = 'adotado';

    // Tentar marcar no PetsService (pode ser pet da API)
    this.petsService.adoptPet(pet.id);

    // Também tentar atualizar no localStorage dos pets dos doadores
    try {
      const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
      const petIndex = petsCadastrados.findIndex((p: any) => p.id === pet.id);

      if (petIndex !== -1) {
        petsCadastrados[petIndex].status = 'adotado';
        localStorage.setItem('petsCadastrados', JSON.stringify(petsCadastrados));
        console.log('Pet atualizado no localStorage dos doadores');
      }
    } catch (error) {
      console.error('Erro atualizando pet no localStorage:', error);
    }

    this.atualizarEstatisticas();
    console.log('Pet marcado como adotado:', pet);
  }

  // ===== EDIÇÃO DE PETS (apenas mediadores) =====
  isEditing: boolean = false;
  editingPet: PetComDoador | null = null;
  editedData: Partial<PetComDoador> = {};

  openEditPet(pet: PetComDoador) {
    if (this.currentUser?.role !== 'mediador') {
      alert('❌ Apenas mediadores podem editar informações dos pets.');
      return;
    }
    this.isEditing = true;
    this.editingPet = { ...pet };
    this.editedData = {
      nome: pet.nome,
      raca: pet.raca,
      idade: pet.idade,
      porte: pet.porte,
      energia: pet.energia,
      personalidade: pet.personalidade,
      beneficioEmocional: pet.beneficioEmocional
    } as Partial<PetComDoador>;
  }

  cancelEditPet() {
    this.isEditing = false;
    this.editingPet = null;
    this.editedData = {};
  }

  saveEditPet() {
    if (!this.editingPet) return;

    const id = this.editingPet.id;
    const payload: Partial<Pet> = {
      nome: this.editedData.nome,
      raca: this.editedData.raca,
      idade: this.editedData.idade,
      porte: this.editedData.porte as any,
      energia: (this.editedData.energia as any) || 'moderado',
      personalidade: this.editedData.personalidade,
      beneficioEmocional: this.editedData.beneficioEmocional
    };

    const isApiPet = id < 100;

    if (isApiPet) {
      this.petsService.updatePet(id, payload).subscribe({
        next: () => {
          // Atualizar lista local
          this.pets = this.pets.map(p => p.id === id ? { ...p, ...payload } as PetComDoador : p);
          this.isEditing = false;
          this.editingPet = null;
          alert('✅ Pet atualizado com sucesso!');
        },
        error: () => alert('❌ Erro ao salvar alterações na API.')
      });
    } else {
      // Atualizar no localStorage dos doadores
      try {
        const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
        const idx = petsCadastrados.findIndex((p: any) => p.id === id);
        if (idx !== -1) {
          const updated = { ...petsCadastrados[idx], ...payload };
          petsCadastrados[idx] = updated;
          localStorage.setItem('petsCadastrados', JSON.stringify(petsCadastrados));
        }
        // Refletir localmente
        this.pets = this.pets.map(p => p.id === id ? { ...p, ...payload } as PetComDoador : p);
        // Notificar outros painéis
        if ('emitChange' in this.petsService) {
          // @ts-ignore
          this.petsService.emitChange();
        }
        this.isEditing = false;
        this.editingPet = null;
        alert('✅ Pet atualizado com sucesso!');
      } catch (e) {
        alert('❌ Erro ao atualizar o pet local.');
      }
    }
  }

  setActiveTab(tab: 'dashboard' | 'pets' | 'usuarios' | 'depoimentos' | 'relatorios' | 'solicitacoes-adocao') {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ===== DEPOIMENTOS =====
  isEditingDepoimento = false;
  editingDepoimento: Depoimento | null = null;
  editingDepoimentoData: Partial<Depoimento> = {};

  abrirModalEdicao(depoimento: Depoimento) {
    this.editingDepoimento = { ...depoimento };
    this.editingDepoimentoData = { depoimento: depoimento.depoimento };
    this.isEditingDepoimento = true;
  }

  cancelarEdicaoDepoimento() {
    this.isEditingDepoimento = false;
    this.editingDepoimento = null;
    this.editingDepoimentoData = {};
  }

  salvarEdicaoDepoimento() {
    if (!this.editingDepoimento || this.editingDepoimentoData.depoimento === undefined) return;

    // Por enquanto, apenas atualiza localmente.
    // A lógica de serviço será implementada a seguir.
    this.depoimentoService.atualizarDepoimento({
      ...this.editingDepoimento,
      depoimento: this.editingDepoimentoData.depoimento
    });

    this.cancelarEdicaoDepoimento();
  }

  getDepoimentosPendentes(): Depoimento[] {
    return this.depoimentos.filter(d => !d.aprovado);
  }

  getDepoimentosAprovados(): Depoimento[] {
    return this.depoimentos.filter(d => d.aprovado);
  }

  aprovarDepoimento(depoimento: Depoimento) {
    this.depoimentoService.aprovarDepoimento(depoimento);
  }

  rejeitarDepoimento(depoimento: Depoimento) {
    if (confirm('Tem certeza que deseja rejeitar este depoimento? A ação não pode ser desfeita.')) {
      this.depoimentoService.rejeitarDepoimento(depoimento);
    }
  }

  // ===== SOLICITAÇÕES DE ADOÇÃO =====
  aprovarSolicitacao(solicitacao: SolicitacaoAdocao) {
    solicitacao.status = 'aprovada';
    this.atualizarSolicitacoes(solicitacao);
  }

  rejeitarSolicitacao(solicitacao: SolicitacaoAdocao) {
    solicitacao.status = 'rejeitada';
    this.atualizarSolicitacoes(solicitacao);
  }

  private atualizarSolicitacoes(solicitacaoAtualizada: SolicitacaoAdocao) {
    const solicitacoes = JSON.parse(localStorage.getItem('adocaoSolicitations') || '[]');
    const index = solicitacoes.findIndex((s: SolicitacaoAdocao) => s.id === solicitacaoAtualizada.id);
    if (index !== -1) {
      solicitacoes[index] = solicitacaoAtualizada;
      localStorage.setItem('adocaoSolicitations', JSON.stringify(solicitacoes));
      this.solicitacoesAdocao = solicitacoes.filter((s: SolicitacaoAdocao) => s.status === 'pendente');
    }
  }

  // Métodos para obter totais para cada seção
  getPendingPetsCount(): number {
    return this.pets.filter(p => p.status === 'pendente').length;
  }

  getAvailablePetsCount(): number {
    return this.pets.filter(p => p.status === 'aprovado' && !p.adotado).length;
  }

  getAdoptedPetsCount(): number {
    return this.pets.filter(p => p.adotado).length;
  }

  // Limpar/finalizar pets adotados (remover do sistema)
  limparPetsAdotados(): void {
    const petsAdotados = this.getPetsPorStatus('adotado');

    if (petsAdotados.length === 0) {
      alert('Nenhum pet adotado para limpar.');
      return;
    }

    const confirmacao = confirm(`🧹 Tem certeza que deseja LIMPAR todos os ${petsAdotados.length} pets adotados?\n\nEsta ação irá:\n• Remover definitivamente os pets adotados do sistema\n• Limpar o histórico de adoções\n• Não pode ser desfeita\n\nOs pets desaparecerão completamente da plataforma.`);

    if (!confirmacao) return;

    try {
      // Remover pets adotados da lista local
      this.pets = this.pets.filter(pet => !pet.adotado);

      // Remover pets adotados do localStorage (pets cadastrados pelos doadores)
      const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
      const petsCadastradosFiltrados = petsCadastrados.filter((pet: any) => pet.status !== 'adotado');
      localStorage.setItem('petsCadastrados', JSON.stringify(petsCadastradosFiltrados));

      // Atualizar estatísticas
      this.atualizarEstatisticas();

      console.log(`✅ ${petsAdotados.length} pets adotados foram limpos/finalizados do sistema`);

      // Feedback para o usuário
      if (petsAdotados.length === 1) {
        alert(`✅ 1 pet adotado foi limpo/finalizado com sucesso!\n\nO histórico foi removido permanentemente do sistema.`);
      } else {
        alert(`✅ ${petsAdotados.length} pets adotados foram limpos/finalizados com sucesso!\n\nO histórico foi removido permanentemente do sistema.`);
      }

    } catch (error) {
      console.error('Erro ao limpar pets adotados:', error);
      alert('❌ Erro ao limpar pets adotados. Tente novamente.');
    }
  }

  excluirUsuario(email: string) {
    if (confirm(`Tem certeza que deseja excluir o usuário com o e-mail ${email}? Esta ação não pode ser desfeita.`)) {
      this.authService.excluirUsuario(email);
      this.loadUsuarios(); // Recarrega a lista de usuários
      alert('Usuário excluído com sucesso!');
    }
  }
}
