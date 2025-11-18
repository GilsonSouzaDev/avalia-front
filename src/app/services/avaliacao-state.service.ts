import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Definição da interface para o objeto de avaliação em construção
export interface AvaliacaoDraft {
  disciplinaId: number | null;
  disciplinaNome: string | null;
  isMista: boolean; // Para coordenadores
  quantidadePerguntas: number | null;
  questoesSelecionadas: any[]; // Substituir 'any' pela interface de Questão
  cabecalho: {
    titulo: string;
    turma: string;
    data: Date | null;
    // Adicionar outros campos de cabeçalho conforme necessário
  };
}

const INITIAL_STATE: AvaliacaoDraft = {
  disciplinaId: null,
  disciplinaNome: null,
  isMista: false,
  quantidadePerguntas: null,
  questoesSelecionadas: [],
  cabecalho: {
    titulo: '',
    turma: '',
    data: null,
  },
};

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoStateService {
  private avaliacaoDraftSubject: BehaviorSubject<AvaliacaoDraft> =
    new BehaviorSubject<AvaliacaoDraft>(INITIAL_STATE);
  public avaliacaoDraft$: Observable<AvaliacaoDraft> =
    this.avaliacaoDraftSubject.asObservable();

  constructor() {}

  /**
   * Retorna o estado atual do rascunho da avaliação.
   */
  getCurrentState(): AvaliacaoDraft {
    return this.avaliacaoDraftSubject.getValue();
  }

  /**
   * Atualiza o estado do rascunho da avaliação com dados parciais.
   * @param partialData Dados parciais a serem mesclados com o estado atual.
   */
  updateState(partialData: Partial<AvaliacaoDraft>): void {
    const currentState = this.getCurrentState();
    const newState = { ...currentState, ...partialData };
    this.avaliacaoDraftSubject.next(newState);
  }

  /**
   * Atualiza o cabeçalho da avaliação.
   * @param partialCabecalho Dados parciais do cabeçalho.
   */
  updateCabecalho(
    partialCabecalho: Partial<AvaliacaoDraft['cabecalho']>
  ): void {
    const currentState = this.getCurrentState();
    const newCabecalho = { ...currentState.cabecalho, ...partialCabecalho };
    const newState = { ...currentState, cabecalho: newCabecalho };
    this.avaliacaoDraftSubject.next(newState);
  }

  /**
   * Limpa o estado do rascunho da avaliação, voltando ao estado inicial.
   */
  clearState(): void {
    this.avaliacaoDraftSubject.next(INITIAL_STATE);
  }
}
