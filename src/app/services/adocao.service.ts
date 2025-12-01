import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pet } from './pets.service';
import { Usuario } from './auth.service';

export interface SolicitacaoAdocao {
  id: number;
  pet: Pet;
  solicitante: Usuario;
  data: Date;
  status: 'pendente' | 'aprovada' | 'rejeitada';
}

@Injectable({
  providedIn: 'root'
})
export class AdocaoService {
  private _solicitacoes = new BehaviorSubject<SolicitacaoAdocao[]>([]);
  solicitacoes$ = this._solicitacoes.asObservable();

  constructor() {
    this.loadSolicitacoes();
  }

  private loadSolicitacoes() {
    const solucoesStorage = localStorage.getItem('solicitacoesAdocao');
    if (solucoesStorage) {
      this._solicitacoes.next(JSON.parse(solucoesStorage));
    }
  }

  private saveSolicitacoes(solicitacoes: SolicitacaoAdocao[]) {
    localStorage.setItem('solicitacoesAdocao', JSON.stringify(solicitacoes));
    this._solicitacoes.next(solicitacoes);
  }

  novaSolicitacao(pet: Pet, solicitante: Usuario) {
    const solicitacoes = this._solicitacoes.getValue();
    const novaSolicitacao: SolicitacaoAdocao = {
      id: Date.now(),
      pet,
      solicitante,
      data: new Date(),
      status: 'pendente'
    };
    this.saveSolicitacoes([...solicitacoes, novaSolicitacao]);
  }

  aprovarSolicitacao(id: number) {
    const solicitacoes = this._solicitacoes.getValue();
    const index = solicitacoes.findIndex(s => s.id === id);
    if (index > -1) {
      solicitacoes[index].status = 'aprovada';
      this.saveSolicitacoes(solicitacoes);
    }
  }

  rejeitarSolicitacao(id: number) {
    const solicitacoes = this._solicitacoes.getValue();
    const index = solicitacoes.findIndex(s => s.id === id);
    if (index > -1) {
      solicitacoes[index].status = 'rejeitada';
      this.saveSolicitacoes(solicitacoes);
    }
  }
}
