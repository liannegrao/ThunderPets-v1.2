import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Depoimento {
  id: number;
  nome: string;
  depoimento: string;
  aprovado: boolean;
  fotoUrl?: string; // Campo opcional para a URL da imagem
}

@Injectable({
  providedIn: 'root'
})
export class DepoimentoService {
  private depoimentosSubject = new BehaviorSubject<Depoimento[]>(this.getDepoimentosFromStorage());
  depoimentos$ = this.depoimentosSubject.asObservable();

  constructor() { }

  private getDepoimentosFromStorage(): Depoimento[] {
    const depoimentos = localStorage.getItem('depoimentos');
    return depoimentos ? JSON.parse(depoimentos) : [];
  }

  addDepoimento(depoimento: Omit<Depoimento, 'id'>): void {
    const depoimentos = this.getDepoimentosFromStorage();
    const novoDepoimento: Depoimento = {
      ...depoimento,
      id: new Date().getTime() // Gerador de ID simples
    };
    depoimentos.push(novoDepoimento);
    localStorage.setItem('depoimentos', JSON.stringify(depoimentos));
    this.depoimentosSubject.next(depoimentos);
  }

  aprovarDepoimento(depoimentoParaAprovar: Depoimento): void {
    const depoimentos = this.getDepoimentosFromStorage();
    const index = depoimentos.findIndex(d => d.id === depoimentoParaAprovar.id);
    if (index > -1) {
      depoimentos[index].aprovado = true;
      localStorage.setItem('depoimentos', JSON.stringify(depoimentos));
      this.depoimentosSubject.next(depoimentos);
    }
  }

  rejeitarDepoimento(depoimentoParaRejeitar: Depoimento): void {
    let depoimentos = this.getDepoimentosFromStorage();
    depoimentos = depoimentos.filter(d => d.id !== depoimentoParaRejeitar.id);
    localStorage.setItem('depoimentos', JSON.stringify(depoimentos));
    this.depoimentosSubject.next(depoimentos);
  }

  atualizarDepoimento(depoimentoAtualizado: Depoimento): void {
    const depoimentos = this.getDepoimentosFromStorage();
    const index = depoimentos.findIndex(d => d.id === depoimentoAtualizado.id);
    if (index > -1) {
      depoimentos[index] = depoimentoAtualizado;
      localStorage.setItem('depoimentos', JSON.stringify(depoimentos));
      this.depoimentosSubject.next(depoimentos);
    }
  }
}
