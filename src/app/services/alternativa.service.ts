import { Injectable, inject } from '@angular/core';
import { Alternativa } from '../interfaces/Alternativa';
import { Pergunta } from '../interfaces/Pergunta';
import { BaseService } from '../data/base.service';

@Injectable({
  providedIn: 'root',
})
export class AlternativaService {

  private baseService = inject(BaseService);

  getAlternativasByPergunta(perguntaId: number): Alternativa[] {
    const pergunta = this.encontrarPergunta(perguntaId);
    return pergunta ? pergunta.alternativas : [];
  }

  addAlternativa(texto: string, perguntaId: number): void {
    const pergunta = this.encontrarPergunta(perguntaId);

    if (!pergunta) {
      return;
    }

    const novoId = new Date().getTime();

    const novaAlternativa: Alternativa = {
      id: novoId,
      texto: texto,
      perguntaId: perguntaId,
    };

    const novasAlternativas = [...pergunta.alternativas, novaAlternativa];

    this.baseService.updatePergunta(perguntaId, {
      alternativas: novasAlternativas,
    });
  }

  updateAlternativa(alternativa: Alternativa): void {
    const pergunta = this.encontrarPergunta(alternativa.perguntaId);

    if (!pergunta) return;

    const novasAlternativas = pergunta.alternativas.map((alt) =>
      alt.id === alternativa.id ? alternativa : alt
    );

    this.baseService.updatePergunta(alternativa.perguntaId, {
      alternativas: novasAlternativas,
    });
  }

  deleteAlternativa(alternativaId: number, perguntaId: number): void {
    const pergunta = this.encontrarPergunta(perguntaId);

    if (!pergunta) return;
    const novasAlternativas = pergunta.alternativas.filter(
      (alt) => alt.id !== alternativaId
    );

    this.baseService.updatePergunta(perguntaId, {
      alternativas: novasAlternativas,
    });
  }

  private encontrarPergunta(perguntaId: number): Pergunta | undefined {
    return this.baseService.perguntas().find((p) => p.id === perguntaId);
  }
}
