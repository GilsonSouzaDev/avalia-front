import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AvaliacaoStateService } from './avaliacao-state.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { DialogService } from '../shared/services/dialog.service';
import { Professor, TipoProfessor } from '../interfaces/Professor';
import { Disciplina } from '../interfaces/Disciplina';
import { AvaliacaoDraft } from '../interfaces/Avaliacao';
import { Pergunta } from '../interfaces/Pergunta';
import { Cabecalho } from '../interfaces/Cabecalho';

@Injectable({
  providedIn: 'root'
})
export class GerarProvaManagerService {
  private fb = inject(FormBuilder);
  private avaliacaoStateService = inject(AvaliacaoStateService);
  private pdfGeneratorService = inject(PdfGeneratorService);
  private dialogService = inject(DialogService);

  createDisciplinaForm(): FormGroup {
    return this.fb.group({
      disciplinaIds: [[] as number[], Validators.required],
      quantidadeTotal: [null, [Validators.required, Validators.min(1)]],
    });
  }

  createCabecalhoForm(): FormGroup {
    return this.fb.group({
      curso: ['', Validators.required],
      titulo: ['', Validators.required],
      turma: ['', Validators.required],
      periodo: ['', Validators.required],
      data: ['', Validators.required],
      totalPontos: ['10.0', Validators.required],
      duracao: ['', Validators.required],
    });
  }

  generateDurationOptions(): string[] {
    const options = [];
    let minutes = 60;
    const maxMinutes = 4 * 60;
    while (minutes <= maxMinutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      let text = '';
      if (hours > 0) text += `${hours} hora${hours > 1 ? 's' : ''}`;
      if (mins > 0) text += ` e ${mins} minutos`;
      options.push(text.trim());
      minutes += 30;
    }
    return options;
  }

  filterDisciplinas(user: Professor, todas: Disciplina[], modoSelecionado: TipoProfessor): Disciplina[] {
    if (modoSelecionado === TipoProfessor.PROFESSOR) {
      const professor = user as any;
      const meusIds: number[] = Array.isArray(professor.disciplinas)
        ? professor.disciplinas.map((d: any) => (typeof d === 'object' ? d.id : d))
        : [];
      return todas.filter((d) => meusIds.includes(d.id));
    }
    return todas;
  }

  calculateAvailableQuestions(ids: number[], todasPerguntas: Pergunta[]): number {
    return todasPerguntas.filter((q) => ids.includes(q.disciplina.id)).length;
  }

  syncFormWithDraft(draft: AvaliacaoDraft, discForm: FormGroup, cabForm: FormGroup): number[] {
    if (!draft) return [];

    let ids: number[] = [];
    if (draft.selectedDisciplinaIds?.length) {
      ids = draft.selectedDisciplinaIds;
    } else if ((draft as any).disciplinaId) {
      ids = [(draft as any).disciplinaId];
    } else {
      ids = (draft.questoesSelecionadas || [])
        .map((q) => q.disciplina.id)
        .filter((v, i, a) => a.indexOf(v) === i);
    }

    if (ids.length) {
      discForm.get('disciplinaIds')?.setValue(ids);
    }
    if ((draft as any).quantidadePerguntas) {
      discForm.get('quantidadeTotal')?.setValue((draft as any).quantidadePerguntas);
    }

    if (draft.cabecalho) {
      const cab = draft.cabecalho;
      let dataStr = '';
      
      if (cab.data) {
        const d = new Date(cab.data);
        if (!isNaN(d.getTime())) {
          const ano = d.getFullYear();
          const mes = String(d.getMonth() + 1).padStart(2, '0');
          const dia = String(d.getDate()).padStart(2, '0');
          dataStr = `${ano}-${mes}-${dia}`;
        }
      }

      cabForm.patchValue({
        curso: cab.curso || '',
        titulo: cab.titulo || '',
        turma: cab.turma || '',
        periodo: cab.periodo || '2º Semestre de 2025',
        data: dataStr,
        totalPontos: cab.totalPontos || '10.0',
        duracao: cab.duracao || '2 horas',
      });
    }

    return ids; 
  }

  saveStep1(discForm: FormGroup, draft: AvaliacaoDraft, disciplinasDisponiveis: Disciplina[]): void {
    const ids: number[] = discForm.get('disciplinaIds')?.value || [];
    const qtd = Number(discForm.get('quantidadeTotal')?.value);
    
    const principalDiscId = ids.length === 1 ? ids[0] : null;
    const principalDisc = disciplinasDisponiveis.find((d) => d.id === principalDiscId);

    this.avaliacaoStateService.updateState({
      disciplinaId: principalDiscId,
      disciplinaNome: principalDisc ? principalDisc.nome : 'Prova Multidisciplinar',
      isMista: ids.length > 1,
      quantidadePerguntas: qtd,
      selectedDisciplinaIds: ids,
    });

    const currentQuestions = draft.questoesSelecionadas || [];
    const validQuestions = currentQuestions.filter((q) => ids.includes(q.disciplina.id));
    
    if (validQuestions.length > qtd) {
      validQuestions.splice(qtd);
    }
    
    this.avaliacaoStateService.updateState({
      questoesSelecionadas: validQuestions,
    });
  }

  saveCabecalho(cabForm: FormGroup, user: Professor | null, draft: AvaliacaoDraft, perfil: TipoProfessor) {
    const val = cabForm.value;
    const nomeProfessor = user?.nome || 'Professor';
    const nomeDisciplina = perfil === TipoProfessor.COORDENADOR 
      ? 'Prova Geral' 
      : (draft.disciplinaNome || 'Disciplina');

    let dataCorrigida = new Date();
    if (val.data) {
      const [ano, mes, dia] = val.data.split('-').map(Number);
      dataCorrigida = new Date(ano, mes - 1, dia);
    }

    const cabData: Partial<Cabecalho> = {
      curso: val.curso,
      titulo: val.titulo,
      turma: val.turma,
      periodo: val.periodo,
      totalPontos: val.totalPontos,
      duracao: val.duracao,
      data: dataCorrigida,
      professor: nomeProfessor,
      disciplina: nomeDisciplina,
    };

    this.avaliacaoStateService.updateCabecalho(cabData);
  }

  toggleQuestao(q: Pergunta, draft: AvaliacaoDraft, limit: number): void {
    const questoes = [...(draft.questoesSelecionadas || [])];
    const index = questoes.findIndex((x) => x.id === q.id);

    if (index > -1) {
      questoes.splice(index, 1);
    } else if (questoes.length < limit) {
      questoes.push(q);
    }

    this.avaliacaoStateService.updateState({ questoesSelecionadas: questoes });
  }

  confirmAndGeneratePDF(callbackSuccess: () => void) {
    const finalDraft = this.avaliacaoStateService.getCurrentState();
    
    this.dialogService.confirmAction({
      title: 'Gerar PDF',
      message: 'Tem certeza que deseja finalizar e gerar o arquivo PDF da prova?',
      confirmButtonText: 'Gerar Prova',
      cancelButtonText: 'Voltar',
      titleColor: '#1565c0',
      action: () => {
        return of(true).pipe(
          delay(1000),
          tap(async () => {
            await this.pdfGeneratorService.generatePdf(finalDraft);
          })
        );
      },
    }).afterClosed().subscribe((sucesso) => {
      if (sucesso) {
        this.avaliacaoStateService.clearState();
        callbackSuccess();
      }
    });
  }

  confirmCancelProva(callbackSuccess: () => void) {
    this.dialogService.confirmAction({
      title: 'Cancelar Prova',
      message: 'Você tem certeza que deseja cancelar a criação desta prova? Todas as seleções serão perdidas.',
      confirmButtonText: 'Sim, Cancelar',
      cancelButtonText: 'Voltar',
      titleColor: '#c62828',
      action: () => {
        return of(true).pipe(
          delay(500),
          tap(() => this.avaliacaoStateService.clearState())
        );
      },
    }).afterClosed().subscribe((sucesso) => {
      if (sucesso) callbackSuccess();
    });
  }

  confirmCancelSelecao(callbackSuccess: () => void) {
    this.dialogService.confirmAction({
      title: 'Voltar ao Início',
      message: 'Deseja cancelar a seleção atual e voltar para a escolha de disciplinas?',
      confirmButtonText: 'Voltar',
      cancelButtonText: 'Continuar Aqui',
      titleColor: '#c62828',
      action: () => {
        return of(true).pipe(
          delay(300),
          tap(() => this.avaliacaoStateService.clearState())
        );
      },
    }).afterClosed().subscribe((sucesso) => {
      if (sucesso) callbackSuccess();
    });
  }
}