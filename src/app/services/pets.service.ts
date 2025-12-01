import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError, forkJoin } from 'rxjs';

export interface Pet {
  id: number;
  nome: string;
  especie: 'cachorro' | 'gato';
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
  foto_url?: string; // URL do Cloudinary
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

// Base hardcoded (fallback) - CARREGADA UMA ÚNICA VEZ
const PETS_DATABASE: Pet[] = [
  // Cachorros
  {
    id: 1,
    nome: "Caramelo",
    especie: "cachorro" as const,
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
    especie: "cachorro" as const,
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
    especie: "cachorro" as const,
    raca: "Poodle",
    idade: 60,
    porte: "pequeno" as const,
    energia: "moderado" as const,
    personalidade: "Intelligent e fiel, perfeito para ansiedade. Sua calma presença traz paz para momentos de stress.",
    beneficioEmocional: "Apoio contra Ansiedade",
    saude: "Vacinas em dia, castrado.",
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
    nome: "Lua",
    especie: "cachorro" as const,
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
  },
  // Gatos
  {
    id: 101,
    nome: "Purês",
    especie: "gato" as const,
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
    especie: "gato" as const,
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
];

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private apiUrl = 'http://localhost:3001/api';
  private petsData = new BehaviorSubject<Pet[]>([]);
  public pets$ = this.petsData.asObservable();

  // FLAG PARA GARANTIR CARREGAMENTO ÚNICO
  private hasLoaded = false;

  constructor(private http: HttpClient) {
    // Carrega apenas uma vez
    if (!this.hasLoaded) {
      this.loadAllPetsOnce();
      this.hasLoaded = true;
    }
  }

  // Permite forçar um refresh para assinantes (ex.: recarregar dados locais)
  emitChange(): void {
    this.petsData.next([...this.petsData.value]);
  }

  // 🔥 CARREGAMENTO ÚNICO E DEFINITIVO - NENHUMA DUPLICAÇÃO
  private loadAllPetsOnce(): void {
    console.log('🚀 Iniciando carregamento único de pets...');

    // 1️⃣ Carregar pets da API
    const apiPets$ = this.http.get<any[]>(`${this.apiUrl}/pets`).pipe(
      tap(apiPets => console.log('📡 API carregou:', apiPets.length, 'pets')),
      catchError(error => {
        console.error('❌ Erro na API, usando fallback vazio:', error);
        return of([]);
      })
    );

    // 2️⃣ Usar PETS_DATABASE diretamente (já é array)
    const basePets$ = of(PETS_DATABASE).pipe(
      tap(basePets => console.log('🏠 Base local:', basePets.length, 'pets'))
    );

    // 3️⃣ Carregar pets do localStorage
    const localPets$ = of(this.loadPetsFromLocalStorage()).pipe(
      tap(localPets => console.log('💾 LocalStorage:', localPets.length, 'pets'))
    );

    // 🔄 COMBINAR TUDO EM UMA ÚNICA OPERAÇÃO
    forkJoin([apiPets$, basePets$, localPets$]).subscribe({
      next: ([apiPets, basePets, localPets]) => {
        console.log('🔄 Combinando fontes de dados...');

        // Mapeamento da API (igual ao anterior)
        const mappedApiPets: Pet[] = apiPets.map(apiPet => ({
          id: apiPet.id,
          nome: apiPet.nome,
          especie: (apiPet.especie === 'cachorro' || apiPet.especie === 'gato') ? apiPet.especie : 'cachorro',
          raca: apiPet.raca,
          idade: apiPet.idade_meses,
          porte: apiPet.porte,
          energia: apiPet.energia,
          personalidade: apiPet.personalidade,
          beneficioEmocional: apiPet.beneficio_emocional,
          saude: apiPet.saude,
          cuidados: apiPet.cuidados,
          historia: apiPet.historia,
          casaIdeal: apiPet.casa_ideal,
          foto: apiPet.foto_url || '/img/THUNDERPETS (4) (1).png',
          foto_url: apiPet.foto_url,
          adotado: apiPet.adotado,
          compatibilidade: {
            emocao: ['depressao', 'solidao', 'mudanca', 'terapia'],
            energia: [apiPet.energia],
            disponibilidade: ['poucas-horas', 'metade-dia', 'todo-dia', 'flexivel']
          },
          compatibilidadeScore: {
            depressao: Number(apiPet.depressao_score) || 50,
            ansiedade: Number(apiPet.ansiedade_score) || 50,
            solidao: Number(apiPet.solidao_score) || 50
          }
        }));

        // 🔥 MERGE FINAL: API + BASE + LOCALSTORAGE
        const mergedPets = [...mappedApiPets, ...basePets, ...localPets];

        // 🔍 REMOVER DUPLICATAS POR ID (prioridade: API > Base > LocalStorage)
        const uniquePets = this.removeDuplicatesById(mergedPets);

        console.log('✅ Merge final:', {
          api: mappedApiPets.length,
          base: basePets.length,
          local: localPets.length,
          merged: mergedPets.length,
          unique: uniquePets.length
        });

        // 🎯 ÚNICA CHAMADA PARA petsData.next() - APENAS AQUI!
        this.petsData.next(uniquePets);
        console.log('🎉 Carregamento único concluído! Total pets:', uniquePets.length);
      },
      error: (error) => {
        console.error('💥 Erro crítico no carregamento:', error);
        // Fallback mínimo
        this.petsData.next(PETS_DATABASE);
      }
    });
  }

  // 🔧 REMOVER DUPLICATAS POR ID (mantém a primeira ocorrência)
  private removeDuplicatesById(pets: Pet[]): Pet[] {
    const seen = new Set<number>();
    return pets.filter(pet => {
      if (seen.has(pet.id)) {
        return false;
      }
      seen.add(pet.id);
      return true;
    });
  }

  // 📱 CARREGAR PETS DO LOCALSTORAGE (simples, sem conversão complexa)
  private loadPetsFromLocalStorage(): Pet[] {
    try {
      const stored = localStorage.getItem('petsCadastrados');
      if (!stored) return [];

      const externalPets = JSON.parse(stored);
      return externalPets.map((externalPet: any) => {
        // Conversão simplificada para evitar complexidade
        const score = this.calculateCompatibilityScore(externalPet);
        return {
          id: externalPet.id || Date.now(),
          nome: externalPet.nome,
          raca: externalPet.raca,
          especie: (externalPet.especie === 'cachorro' || externalPet.especie === 'gato') ? externalPet.especie : 'cachorro',
          idade: externalPet.unidade_idade === 'anos' ? externalPet.idade * 12 : externalPet.idade,
          porte: (externalPet.porte === 'pequeno' || externalPet.porte === 'medio' || externalPet.porte === 'grande') ? externalPet.porte : 'medio',
          energia: this.mapEnergyLevel(externalPet.energia),
          personalidade: this.buildPersonalityString(externalPet),
          beneficioEmocional: this.determineEmotionalBenefit(externalPet),
          saude: this.buildHealthString(externalPet),
          cuidados: 'Cuidados específicos serão informados no contato.',
          historia: externalPet.descricao || 'Pet cadastrado recentemente na ThunderPets.',
          casaIdeal: 'Adequado às necessidades terapêuticas e estilo de vida.',
          foto: externalPet.foto_url || '/img/THUNDERPETS (4) (1).png',
          foto_url: externalPet.foto_url,
          adotado: false,
          compatibilidade: score.compatibilidade,
          compatibilidadeScore: score.scores
        } as Pet;
      });
    } catch (error) {
      console.error('Erro carregando localStorage:', error);
      return [];
    }
  }

  // Métodos auxiliares (mantidos iguais)
  private calculateCompatibilityScore(externalPet: any): { compatibilidade: any, scores: any } {
    const descricao = externalPet.descricao?.toLowerCase() || '';
    const caracteristicas = externalPet.caracteristicas_positivas?.toLowerCase() || '';

    let energiaType: string[];
    switch (externalPet.energia) {
      case 'baixo': energiaType = ['calmo-caseiro']; break;
      case 'medio': energiaType = ['moderado']; break;
      case 'alto': energiaType = ['ativo-aventurado']; break;
      default: energiaType = ['moderado'];
    }

    let depressao = 50, ansiedade = 50, solidao = 50;
    if (descricao.includes('depress') || caracteristicas.includes('depress')) depressao += 30;
    if (descricao.includes('ansied') || caracteristicas.includes('ansied')) ansiedade += 30;
    if (descricao.includes('solid') || caracteristicas.includes('solid')) solidao += 30;
    if (energiaType.includes('ativo-aventurado')) depressao += 20;
    if (energiaType.includes('calmo-caseiro')) ansiedade += 20;
    depressao = Math.min(100, depressao);
    ansiedade = Math.min(100, ansiedade);
    solidao = Math.min(100, solidao);

    return {
      compatibilidade: {
        emocao: ['depressao', 'ansiedade', 'solidao'],
        energia: energiaType,
        disponibilidade: ['poucas-horas', 'metade-dia', 'todo-dia']
      },
      scores: { depressao, ansiedade, solidao }
    };
  }

  private mapEnergyLevel(level: string): 'calmo-caseiro'|'moderado'|'ativo-aventurado' {
    switch(level){
      case 'baixo': return 'calmo-caseiro';
      case 'medio': return 'moderado';
      case 'alto': return 'ativo-aventurado';
      default: return 'moderado';
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

  // Sistema de matching terapêutico inteligente - API
  findTherapeuticMatches(userPreferences: {
    situacao: string;
    energia: string;
    disponibilidade: string[];
  }): Observable<Pet[]> {
    const params = new HttpParams()
      .set('situacao', userPreferences.situacao)
      .set('energia', userPreferences.energia)
      .set('disponibilidade', userPreferences.disponibilidade.join(','));

    return this.http.get<Pet[]>(`${this.apiUrl}/pets/matching`, { params }).pipe(
      tap(matches => console.log(`💚 API: ${matches.length} pets compatíveis encontrados`)),
      catchError(error => {
        console.error('❌ Erro no matching via API:', error);
        return of([]);
      })
    );
  }

  getPetById(id: number): Observable<Pet | null> {
    return this.http.get<Pet>(`${this.apiUrl}/pets/${id}`).pipe(
      tap(pet => console.log('🐾 API: Pet encontrado:', pet.nome)),
      catchError(error => {
        console.error('❌ Erro buscando pet:', error);
        return of(null);
      })
    );
  }

  getAllPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/pets`).pipe(
      tap(pets => {
        this.petsData.next(pets);
        console.log('🐕 API: Todos os pets carregados:', pets.length);
      }),
      catchError(error => {
        console.error('❌ Erro carregando todos os pets:', error);
        return of([]);
      })
    );
  }

  createPet(petData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pets`, petData).pipe(
      tap(result => console.log('✅ Pet criado na API:', result)),
      catchError(error => {
        console.error('❌ Erro criando pet:', error);
        throw error;
      })
    );
  }

  adoptPet(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/mediators/adopt/${id}`, {}, {
      headers: { 'x-api-key': 'thunderpets-2024-mediator-secret' }
    }).pipe(
      tap(result => {
        console.log('✅ Pet adotado na API:', result);
        const pets = this.petsData.value;
        const petIndex = pets.findIndex(p => p.id === id);
        if (petIndex !== -1) {
          pets[petIndex].adotado = true;
          this.petsData.next([...pets]);
        }
      }),
      catchError(error => {
        console.error('❌ Erro adotando pet:', error);
        throw error;
      })
    );
  }

  getDogs(): Pet[] {
    return this.petsData.value.filter(p => p.especie === 'cachorro' && !p.adotado);
  }

  getCats(): Pet[] {
    return this.petsData.value.filter(p => p.especie === 'gato' && !p.adotado);
  }

  addPet(pet: Omit<Pet, 'id' | 'adotado'>): void {
    const newId = Math.max(...this.petsData.value.map(p => p.id)) + 1;
    const newPet: Pet = { ...pet, id: newId, adotado: false };
    const updatedPets = [...this.petsData.value, newPet];
    this.petsData.next(updatedPets);
    this.saveToLocalStorage(updatedPets);
  }

  private saveToLocalStorage(pets: Pet[]): void {
    localStorage.setItem('thunderpets_custom_pets', JSON.stringify(pets));
  }

  loadFromLocalStorage(): void {
    const stored = localStorage.getItem('thunderpets_custom_pets');
    if (stored) {
      try {
        const customPets = JSON.parse(stored);
        const merged = [...this.petsData.value, ...customPets];
        this.petsData.next(merged);
      } catch (error) {
        console.error('Erro carregando pets do localStorage:', error);
      }
    }
  }

  refreshExternalPets(): void {
    this.loadExternalPets();
    console.log('🔄 Pets externos recarregados');
  }

  // Método auxiliar para compatibilidade
  private loadExternalPets(): void {
    // Método vazio - carregamento agora é feito em loadAllPetsOnce
  }

  getTotalPets(): string {
    return `Total: ${this.petsData.value.length} pets (API + Base + LocalStorage)`;
  }

  uploadFoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('foto', file);

    return this.http.post<{ url: string }>(
      `${this.apiUrl}/pets/upload`,
      formData
    );
  }

  getImagensCloudinary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pets/images`);
  }

  updatePet(id: number, petData: Partial<Pet>): Observable<any> {
    const url = `${this.apiUrl}/pets/${id}`;
    // Simulação de autenticação: o ideal é que o AuthService forneça o token/role
    const headers = { 'x-user-role': 'mediador' };

    return this.http.put(url, petData, { headers }).pipe(
      tap(() => {
        // Atualizar o BehaviorSubject localmente após o sucesso
        const currentPets = this.petsData.value;
        const updatedPets = currentPets.map(p => p.id === id ? { ...p, ...petData } : p);
        this.petsData.next(updatedPets);
      }),
      catchError(this.handleError<any>('updatePet'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
