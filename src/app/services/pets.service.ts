import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Pet {
  id: number;
  nome: string;
  raca: string;
  idade: number; // em meses
  porte: 'pequeno' | 'medio' | 'grande';
  energia: 'calmo-caseiro' | 'moderado' | 'ativo-aventurado';
  personalidade: string;
  beneficioEmocional?: string;
  saude: string;
  cuidados: string;
  historia: string;
  casaIdeal: string;
  foto: string;
  adotado: boolean;
  compatibilidade: {
    emocao: string[]; // ['depressao', 'ansiedade', 'solidao']
    energia: string[]; // ['calmo-caseiro', 'moderado', 'ativo-aventurado']
    disponibilidade: string[]; // ['poucas-horas', 'metade-dia', 'todo-dia', 'flexivel']
  };
  compatibilidadeScore: {
    depressao: number; // 0-100
    ansiedade: number; // 0-100
    solidao: number; // 0-100
  };
}

// Baseado no sistema do vanilla JS - dados hardcoded para front-end
const PETS_DATABASE = {
  cachorros: [
    {
      id: 1,
      nome: "Biscoito",
      raca: "Golden Retriever",
      idade: 24,
      porte: "medio" as const,
      energia: "ativo-aventurado" as const,
      personalidade: "Energético e brincalhão, perfeito para combater inércia depressiva através de rotina e exercícios. Sua alegria contagiante traz vida para qualquer lar!",
      beneficioEmocional: "Energia & Alegria",
      saude: "Vacinado, esterilizado. Excelente saúde geral.",
      cuidados: "Exercícios diários moderados, escovação semanal além de visitas regulares ao veterinário.",
      historia: "Encontrado ainda filhote nas ruas. Transformado em um companheiro terapêutico amoroso.",
      casaIdeal: "Qualquer lar com disposição para caminhadas e brincadeiras diárias.",
      foto: "/img/cachorro-caramelo-Petlove.jpg",
      adotado: false,
      compatibilidade: {
        emocao: ["depressao", "solidao"],
        energia: ["ativo-aventurado"],
        disponibilidade: ["todo-dia", "metade-dia"]
      },
      compatibilidadeScore: {
        depressao: 85,
        ansiedade: 60,
        solidao: 80
      }
    },
    {
      id: 2,
      nome: "Thor",
      raca: "Labrador",
      idade: 36,
      porte: "medio" as const,
      energia: "moderado" as const,
      personalidade: "Sociável e carinhoso, excelente em combater isolamento social. Sua natureza brincalhona ajuda a reconstruir conexões emocionais.",
      beneficioEmocional: "Socialização & Conexão",
      saude: "Vacinas atualizadas, ótimo estado de saúde.",
      cuidados: "Alimentação balanceada, exercícios diários além de acompanhamento veterinário regular.",
      historia: "Doado por tutores que não podiam mais cuidar. Pronto para encontrar novo lar terapêutico.",
      casaIdeal: "Famílias ou pessoas sozinhas buscando companhia ativa.",
      foto: "/img/raca-de-cachorro-preto.jpg",
      adotado: false,
      compatibilidade: {
        emocao: ["solidao", "mudanca"],
        energia: ["moderado", "ativo-aventurado"],
        disponibilidade: ["todo-dia", "metade-dia", "flexivel"]
      },
      compatibilidadeScore: {
        depressao: 70,
        ansiedade: 50,
        solidao: 90
      }
    },
    {
      id: 3,
      nome: "Buddy",
      raca: "Poodle",
      idade: 60,
      porte: "pequeno" as const,
      energia: "moderado" as const,
      personalidade: "Intelligent e fiel, perfeito para ansiedade. Sua calma presença traz paz para momentos de stress.",
      beneficioEmocional: "Apoio contra Ansiedade",
      saude: "Saudável, vacinado, castrado.",
      cuidados: "Cuidados veterinários regulares, exercícios leves diarios.",
      historia: "Companion dog bem cuidado, procura novo lar amoroso.",
      casaIdeal: "Apartamentos ou casas pequenas com rotina estruturada.",
      foto: "/img/cachorro-_1750287085273-750x375.webp",
      adotado: false,
      compatibilidade: {
        emocao: ["ansiedade", "terapia"],
        energia: ["moderado", "calmo-caseiro"],
        disponibilidade: ["metade-dia", "poucas-horas", "flexivel"]
      },
      compatibilidadeScore: {
        depressao: 50,
        ansiedade: 85,
        solidao: 60
      }
    },
    {
      id: 4,
      nome: "Luna",
      raca: "Beagle",
      idade: 48,
      porte: "pequeno" as const,
      energia: "calmo-caseiro" as const,
      personalidade: "Dócil e carinhosa, ideal para insônia e ansiedade. Sua presença constante ajuda na reconciliação emocional.",
      beneficioEmocional: "Calma & Serenidade",
      saude: "Excelente saúde, vacinas em dia.",
      cuidados: "Ração premium, carinho, escovação mensal.",
      historia: "Encontrada abandonada, recuperada e pronta para terapia.",
      casaIdeal: "Ambientes calmos, residências serenas.",
      foto: "/img/pexels-photo-2247894.jpeg",
      adotado: false,
      compatibilidade: {
        emocao: ["ansiedade", "terapia"],
        energia: ["calmo-caseiro"],
        disponibilidade: ["poucas-horas", "metade-dia", "flexivel"]
      },
      compatibilidadeScore: {
        depressao: 40,
        ansiedade: 95,
        solidao: 70
      }
    }
  ],
  gatos: [
    {
      id: 101,
      nome: "Purês",
      raca: "Vira-lata laranja",
      idade: 24,
      porte: "medio" as const,
      energia: "moderado" as const,
      personalidade: "Gato muito afetuoso! Adora colo humano mas mantém personalidade independente.",
      beneficioEmocional: "Afeto & Companheirismo",
      saude: "Esterilizado, vacinas atualizadas. Contato muito saudável.",
      cuidados: "Limpeza diária da caixa de areia, unhas e frequência regular. Alimentação específica felina.",
      historia: "Resgatado ainda filhote, Purês desfrutou completo cuidado no abrigo.",
      casaIdeal: "Qualquer ambiente doméstico, incluindo apartamentos compactos.",
      foto: "/img/Design sem nome.jpg",
      adotado: false,
      compatibilidade: {
        emocao: ["solidao", "ansiedade"],
        energia: ["moderado", "calmo-caseiro"],
        disponibilidade: ["todo-dia", "metade-dia", "poucas-horas"]
      },
      compatibilidadeScore: {
        depressao: 60,
        ansiedade: 80,
        solidao: 85
      }
    },
    {
      id: 102,
      nome: "Sonecas",
      raca: "Vira-lata cinza",
      idade: 36,
      porte: "medio" as const,
      energia: "calmo-caseiro" as const,
      personalidade: "Gata calma e observadora, prefere ficar olhando pela janela ou em cantos aquecidos. Dorme muito tempo livre.",
      beneficioEmocional: "Paz & Serenidade",
      saude: "Esterilizada, vacinas completas. Está saudável excelente estado.",
      cuidados: "Areia higiênica limpa, controle peso periodicamente. Água sempre fresca.",
      historia: "Gata independente ótima para pessoas que trabalham muito ou famílias calmas.",
      casaIdeal: "Apartamentos silenciosos onde possa descansar sem interrupções frequentes.",
      foto: "/img/patas.png",
      adotado: false,
      compatibilidade: {
        emocao: ["ansiedade", "terapia"],
        energia: ["calmo-caseiro"],
        disponibilidade: ["poucas-horas", "metade-dia", "flexivel"]
      },
      compatibilidadeScore: {
        depressao: 50,
        ansiedade: 90,
        solidao: 60
      }
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private petsData = new BehaviorSubject<Pet[]>([]);
  public pets$ = this.petsData.asObservable();

  constructor() {
    this.initializePets();
    this.loadExternalPets();
  }

  private initializePets(): void {
    const allPets = [...PETS_DATABASE.cachorros, ...PETS_DATABASE.gatos];
    this.petsData.next(allPets);
  }

  private loadExternalPets(): void {
    const storedPets = localStorage.getItem('petsCadastrados');
    if (storedPets) {
      try {
        const externalPets = JSON.parse(storedPets);
        // Converter dados externos para formato Pet
        const convertedPets: Pet[] = externalPets.map((externalPet: any) => {
          // Calcular scores de compatibilidade baseado nos dados
          const score = this.calculateCompatibilityScore(externalPet);

          return {
            id: externalPet.id || Date.now(),
            nome: externalPet.nome,
            raca: externalPet.raca,
            idade: externalPet.unidade_idade === 'anos' ? externalPet.idade * 12 : externalPet.idade,
            porte: externalPet.porte,
            energia: this.mapEnergyLevel(externalPet.energia),
            personalidade: this.buildPersonalityString(externalPet),
            beneficioEmocional: this.determineEmotionalBenefit(externalPet),
            saude: this.buildHealthString(externalPet),
            cuidados: 'Cuidados específicos serão informados no contato.',
            historia: externalPet.descricao || 'Pet cadastrado recentemente na ThunderPets.',
            casaIdeal: 'Adequado às necessidades terapêuticas e estilo de vida.',
            foto: '/img/THUNDERPETS (4) (1).png', // Placeholder
            adotado: false,
            compatibilidade: score.compatibilidade,
            compatibilidadeScore: score.scores
          };
        });

        // Adicionar aos pets existentes
        const currentPets = this.petsData.value;
        const updatedPets = [...currentPets, ...convertedPets.filter(newPet =>
          !currentPets.some(existingPet => existingPet.id === newPet.id)
        )];

        this.petsData.next(updatedPets);
        console.log(`🐕 Carregados ${convertedPets.length} pets externos do localStorage!`);
      } catch (error) {
        console.error('Erro carregando pets externos:', error);
      }
    }
  }

  private calculateCompatibilityScore(externalPet: any): { compatibilidade: any, scores: any } {
    // Calcular scores baseado na descrição e características
    const descricao = externalPet.descricao?.toLowerCase() || '';
    const caracteristicas = externalPet.caracteristicas_positivas?.toLowerCase() || '';

    // Determinar necessidade energética baseada no nível de energia selecionado
    let energiaType: string[];
    switch (externalPet.energia) {
      case 'baixo':
        energiaType = ['calmo-caseiro'];
        break;
      case 'medio':
        energiaType = ['moderado'];
        break;
      case 'alto':
        energiaType = ['ativo-aventurado'];
        break;
      default:
        energiaType = ['moderado'];
    }

    // Simular scores de compatibilidade (poderiam ser mais sofisticados)
    let depressao = 50, ansiedade = 50, solidao = 50;

    // Ajustar baseado nas características mencionadas
    if (descricao.includes('depress') || caracteristicas.includes('depress')) depressao += 30;
    if (descricao.includes('ansied') || caracteristicas.includes('ansied')) ansiedade += 30;
    if (descricao.includes('solid') || caracteristicas.includes('solid')) solidao += 30;

    // Ajustar baseado no nível de energia
    if (energiaType.includes('ativo-aventurado')) depressao += 20;
    if (energiaType.includes('calmo-caseiro')) ansiedade += 20;

    depressao = Math.min(100, depressao);
    ansiedade = Math.min(100, ansiedade);
    solidao = Math.min(100, solidao);

    return {
      compatibilidade: {
        emocao: ['depressao', 'ansiedade', 'solidao'], // Assume compatibilidade geral
        energia: energiaType,
        disponibilidade: ['poucas-horas', 'metade-dia', 'todo-dia'] // Assume flexibilidade geral
      },
      scores: { depressao, ansiedade, solidao }
    };
  }

  private mapEnergyLevel(energiaForm: string): 'calmo-caseiro' | 'moderado' | 'ativo-aventurado' {
    switch (energiaForm) {
      case 'baixo':
        return 'calmo-caseiro';
      case 'medio':
        return 'moderado';
      case 'alto':
        return 'ativo-aventurado';
      default:
        return 'moderado';
    }
  }

  private buildPersonalityString(externalPet: any): string {
    const parts: string[] = [];

    if (externalPet.temperamento && externalPet.temperamento.length > 0) {
      parts.push(`Características: ${externalPet.temperamento.join(', ')}`);
    }

    if (externalPet.descricao) {
      parts.push(externalPet.descricao);
    }

    if (externalPet.caracteristicas_positivas) {
      parts.push(`Pontos positivos: ${externalPet.caracteristicas_positivas}`);
    }

    return parts.length > 0 ? parts.join('. ') : 'Personalidade através do contato direto.';
  }

  private buildHealthString(externalPet: any): string {
    const healthInfo: string[] = [];

    if (externalPet.vacinado) healthInfo.push('Vacinado');
    if (externalPet.vermifugado) healthInfo.push('Vermifugado');
    if (externalPet.castrado) healthInfo.push('Castrado/Sterilizado');

    if (externalPet.necessidades_especiais) {
      healthInfo.push(`Necessidades especiais: ${externalPet.necessidades_especiais}`);
    }

    return healthInfo.length > 0 ? healthInfo.join(', ') : 'Informações de saúde disponíveis no contato.';
  }

  private determineEmotionalBenefit(externalPet: any): string {
    // Simples inferência baseada na descrição
    const descricao = (externalPet.descricao || '').toLowerCase();
    const caracteristicas = (externalPet.caracteristicas_positivas || '').toLowerCase();

    if (descricao.includes('calm') || descricao.includes('seren') || caracteristicas.includes('calm')) {
      return 'Calma & Serenidade';
    } else if (descricao.includes('energ') || descricao.includes('brinc') || caracteristicas.includes('energ')) {
      return 'Energia & Alegria';
    } else if (descricao.includes('soci') || descricao.includes('amist') || caracteristicas.includes('soci')) {
      return 'Socialização & Conexão';
    } else {
      return 'Companheirismo & Afeto';
    }
  }

  // Sistema de matching terapêutico inteligente
  findTherapeuticMatches(userPreferences: {
    situacao: string; // 'depressao' | 'ansiedade' | 'solidao' | 'mudanca' | 'terapia'
    energia: string;  // 'calmo-caseiro' | 'moderado' | 'ativo-aventurado'
    disponibilidade: string[]; // Array de opções selecionadas
  }): Pet[] {
    const { situacao, energia, disponibilidade } = userPreferences;
    const allPets = this.petsData.value;

    console.log('🔍 Buscando matches terapêuticos:', userPreferences);

    const matches = allPets.filter(pet => {
      if (pet.adotado) return false;

      let score = 0;

      // 1. Compatibilidade emocional (peso alto - 40%)
      if (situacao === 'depressao' && pet.compatibilidadeScore.depressao >= 70) score += 40;
      else if (situacao === 'ansiedade' && pet.compatibilidadeScore.ansiedade >= 70) score += 40;
      else if (situacao === 'solidao' && pet.compatibilidadeScore.solidao >= 70) score += 40;
      else if ((situacao === 'mudanca' || situacao === 'terapia')) {
        // Para mudanças ou terapia, média dos scores
        const mediaEmocional = (pet.compatibilidadeScore.depressao +
                               pet.compatibilidadeScore.ansiedade +
                               pet.compatibilidadeScore.solidao) / 3;
        if (mediaEmocional >= 70) score += 40;
      }

      // 2. Compatibilidade energética (peso médio - 30%)
      if (pet.compatibilidade.energia.includes(energia)) score += 30;

      // 3. Disponibilidade (peso baixo - 20%)
      const temCompatibilidadeDisponibilidade = disponibilidade.some(disp =>
        pet.compatibilidade.disponibilidade.includes(disp)
      );
      if (temCompatibilidadeDisponibilidade) score += 20;

      // 4. Pelo menos 70 pontos para ser considerado match
      console.log(`🐾 ${pet.nome}: Pontuação ${score}/90`);
      return score >= 70;
    });

    // Ordenar por compatibilidade emocional específica
    const sorted = matches.sort((a, b) => {
      let scoreA = 0, scoreB = 0;

      if (situacao === 'depressao') {
        scoreA = a.compatibilidadeScore.depressao;
        scoreB = b.compatibilidadeScore.depressao;
      } else if (situacao === 'ansiedade') {
        scoreA = a.compatibilidadeScore.ansiedade;
        scoreB = b.compatibilidadeScore.ansiedade;
      } else if (situacao === 'solidao') {
        scoreA = a.compatibilidadeScore.solidao;
        scoreB = b.compatibilidadeScore.solidao;
      } else {
        // Para casos gerais, média dos scores
        scoreA = (a.compatibilidadeScore.depressao + a.compatibilidadeScore.ansiedade + a.compatibilidadeScore.solidao) / 3;
        scoreB = (b.compatibilidadeScore.depressao + b.compatibilidadeScore.ansiedade + b.compatibilidadeScore.solidao) / 3;
      }

      return scoreB - scoreA; // Descending order
    });

    console.log(`💚 Encontrados ${sorted.length} pets compatíveis para situação de ${situacao}`);
    return sorted.slice(0, 6); // Máximo 6 matches iniciais
  }

  getPetById(id: number): Pet | undefined {
    return this.petsData.value.find(pet => pet.id === id);
  }

  getAllPets(): Pet[] {
    return this.petsData.value;
  }

  getDogs(): Pet[] {
    return PETS_DATABASE.cachorros.filter(pet => !pet.adotado);
  }

  getCats(): Pet[] {
    return PETS_DATABASE.gatos.filter(pet => !pet.adotado);
  }

  // Para futuro - quando implementar doação
  addPet(pet: Omit<Pet, 'id' | 'adotado'>): void {
    const newId = Math.max(...this.petsData.value.map(p => p.id)) + 1;
    const newPet: Pet = { ...pet, id: newId, adotado: false };
    const updatedPets = [...this.petsData.value, newPet];
    this.petsData.next(updatedPets);
    this.saveToLocalStorage(updatedPets);
  }

  // Para futuro - quando implementar adoção
  adoptPet(id: number): boolean {
    const pet = this.getPetById(id);
    if (pet && !pet.adotado) {
      pet.adotado = true;
      this.updatePets();
      return true;
    }
    return false;
  }

  private updatePets(): void {
    this.petsData.next([...this.petsData.value]);
  }

  private saveToLocalStorage(pets: Pet[]): void {
    // Futuro: persistir pets customizados no localStorage
    localStorage.setItem('thunderpets_custom_pets', JSON.stringify(pets));
  }

  loadFromLocalStorage(): void {
    const stored = localStorage.getItem('thunderpets_custom_pets');
    if (stored) {
      try {
        const customPets = JSON.parse(stored);
        // Merge com dados padrão
        const merged = [...this.petsData.value, ...customPets];
        this.petsData.next(merged);
      } catch (error) {
        console.error('Erro carregando pets do localStorage:', error);
      }
    }
  }

  // Método para refrescar pets externos (para garantir dados atualizados)
  refreshExternalPets(): void {
    this.loadExternalPets();
    console.log('🔄 Pets externos recarregados');
  }

  // Método para obter total de pets
  getTotalPets(): string {
    return `Total: ${this.petsData.value.length} pets (${PETS_DATABASE.cachorros.length + PETS_DATABASE.gatos.length} padrão, ${(this.petsData.value.length - PETS_DATABASE.cachorros.length - PETS_DATABASE.gatos.length)} cadastrados)`;
  }
}
