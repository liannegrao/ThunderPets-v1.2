import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SlicePipe } from '@angular/common';

interface PetCadastrado {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  porte: string;
  energia: string;
  foto: string;
  status: 'disponivel' | 'adotado' | 'em_analise';
  dataCadastro: string;
  interessantes?: number;
  descricao: string;
  localizacao: string;
}

interface UsuarioInteressado {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataInteresse: string;
}

@Component({
  selector: 'app-painel-doador',
  imports: [CommonModule],
  templateUrl: './painel-doador.component.html',
  styleUrl: './painel-doador.component.css'
})
export class PainelDoadorComponent implements OnInit, OnDestroy {
  currentUser: Usuario | null = null;
  meusPets: PetCadastrado[] = [];
  selectedPet: PetCadastrado | null = null;
  interessados: UsuarioInteressado[] = [];
  showInteressados = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se usuário está logado
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (!user) {
          this.router.navigate(['/'], { queryParams: { login: 'required' } });
          return;
        }
        this.carregarMeusPets();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Carregar pets cadastrados pelo usuário atual
  carregarMeusPets(): void {
    if (!this.currentUser) return;

    try {
      const petsCadastrados = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');

      // Filtrar apenas pets do usuário atual (usando email como identificador)
      this.meusPets = petsCadastrados
        .filter((pet: any) => pet.usuarioEmail === this.currentUser!.email)
        .map((pet: any) => ({
          id: pet.id,
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca,
          porte: pet.porte,
          energia: pet.energia,
          foto: pet.foto || '/img/THUNDERPETS (4) (1).png',
          status: pet.status || 'disponivel',
          dataCadastro: pet.dataCadastro,
          descricao: pet.descricao,
          localizacao: pet.localizacao,
          interessantes: pet.interessantes || 0
        }));

      console.log(`🐕 ${this.meusPets.length} pets encontrados para ${this.currentUser.nome}`);
    } catch (error) {
      console.error('Erro carregando pets:', error);
      this.meusPets = [];
    }
  }

  // Ver interessados em um pet
  verInteressados(pet: PetCadastrado): void {
    this.selectedPet = pet;
    this.interessados = this.carregarInteressados(pet.id);
    this.showInteressados = true;
  }

  // Simulando interessados (baseado em localStorage fictício)
  private carregarInteressados(petId: number): UsuarioInteressado[] {
    // Em um sistema real, isso viria do backend
    const mockInteressados: UsuarioInteressado[] = [
      {
        id: '1',
        nome: 'Maria Silva',
        email: 'maria@email.com',
        telefone: '(11) 99999-1111',
        dataInteresse: new Date().toISOString()
      },
      {
        id: '2',
        nome: 'João Santos',
        email: 'joao@email.com',
        telefone: '(11) 99999-2222',
        dataInteresse: new Date().toISOString()
      }
    ];

    return this.selectedPet?.interessantes ? mockInteressados.slice(0, this.selectedPet.interessantes) : [];
  }

  // Editar informações do pet
  editarPet(pet: PetCadastrado): void {
    // Por enquanto, apenas mostrar mensagem
    alert(`Funcionalidade de edição será implementada em breve.\n\nPara editar ${pet.nome}, você poderá:\n- Alterar descrição\n- Atualizar fotos\n- Modificar localização\n- Ajustar outras informações`);
  }

  // Removido: Marcar como adotado - só mediadores podem fazer isso
  // Os doadores só podem cadastrar e editar informações básicas dos pets

  // Adicionar novo pet
  adicionarNovoPet(): void {
    this.router.navigate(['/cadastrar-pet']);
  }

  // Fechar modal de interessados
  fecharModal(): void {
    this.showInteressados = false;
    this.selectedPet = null;
  }

  // Formatação de data
  formatarData(dataISO: string): string {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  }

  // Status badge
  getStatusBadge(status: string): { text: string, class: string } {
    switch (status) {
      case 'disponivel':
        return { text: 'Disponível', class: 'status-disponivel' };
      case 'adotado':
        return { text: 'Adotado', class: 'status-adotado' };
      case 'em_analise':
        return { text: 'Em Análise', class: 'status-analise' };
      default:
        return { text: status, class: 'status-default' };
    }
  }

  // Estatísticas rápidas
  getEstatisticas() {
    return {
      totalPets: this.meusPets.length,
      petsDisponiveis: this.meusPets.filter(p => p.status === 'disponivel').length,
      petsAdotados: this.meusPets.filter(p => p.status === 'adotado').length,
      totalInteressados: this.meusPets.reduce((sum, pet) => sum + (pet.interessantes || 0), 0)
    };
  }

  // Formatar telefone para WhatsApp (remover caracteres não numéricos)
  formatarTelefone(telefone: string): string {
    return telefone.replace(/[^\d]/g, '');
  }
}
