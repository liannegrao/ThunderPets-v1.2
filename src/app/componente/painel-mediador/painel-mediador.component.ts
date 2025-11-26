import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, Usuario } from '../../services/auth.service';
import { PetsService, Pet } from '../../services/pets.service';
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
}

@Component({
  selector: 'app-painel-mediador',
  imports: [CommonModule],
  templateUrl: './painel-mediador.component.html',
  styleUrl: './painel-mediador.component.css'
})
export class PainelMediadorComponent implements OnInit {

  private authService = inject(AuthService);
  private petsService = inject(PetsService);
  private router = inject(Router);

  currentUser?: Usuario;
  pets: PetComDoador[] = [];
  usuarios: Usuario[] = [];
  activeTab: string = 'dashboard';

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
    this.atualizarEstatisticas();
  }

  private loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;
    });
  }

  private loadPets() {
    // Inscrever-se no Observable para obter os dados
    this.petsService.pets$.subscribe(petsOriginais => {
      // Simular dados adicionais para cada pet
      this.pets = petsOriginais.map((pet: Pet, index: number) => ({
        ...pet,
        doador: this.usuariosSimulados[index % this.usuariosSimulados.length],
        dataCadastro: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
        status: pet.adotado ? 'adotado' : (Math.random() > 0.7 ? 'pendente' : 'aprovado') as 'pendente' | 'aprovado' | 'adotado'
      }));

      console.log('Pets carregados no painel mediador:', this.pets);
      this.atualizarEstatisticas(); // Atualizar estatísticas após carregar pets
    });
  }

  private loadUsuarios() {
    // Simular usuários - em produção viria de uma API
    this.usuarios = this.usuariosSimulados;
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
    this.petsService.adoptPet(pet.id);
    this.atualizarEstatisticas();
    console.log('Pet marcado como adotado:', pet);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
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
}
