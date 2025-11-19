import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Cabecalho } from '../interfaces/Cabecalho';
import { AvaliacaoDraft } from '../interfaces/Avaliacao';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoStateService {
  private initialState: AvaliacaoDraft = {
    questoesSelecionadas: [],
    cabecalho: {
      instituicao: 'FATEC Guarulhos', // Valor padrão fixo
    },
  };

  private avaliacaoDraftSubject = new BehaviorSubject<AvaliacaoDraft>(
    this.initialState
  );
  public avaliacaoDraft$ = this.avaliacaoDraftSubject.asObservable();

  // Atualiza qualquer parte do estado
  updateState(newState: Partial<AvaliacaoDraft>): void {
    const current = this.avaliacaoDraftSubject.getValue();
    this.avaliacaoDraftSubject.next({ ...current, ...newState });
  }

  // Atualiza especificamente o cabeçalho
  updateCabecalho(dadosCabecalho: Partial<Cabecalho>): void {
    const current = this.avaliacaoDraftSubject.getValue();
    this.avaliacaoDraftSubject.next({
      ...current,
      cabecalho: {
        ...current.cabecalho,
        ...dadosCabecalho,
      },
    });
  }

  getCurrentState(): AvaliacaoDraft {
    return this.avaliacaoDraftSubject.getValue();
  }

  clearState(): void {
    this.avaliacaoDraftSubject.next(this.initialState);
  }
}
