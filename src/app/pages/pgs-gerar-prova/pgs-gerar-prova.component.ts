import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { AvaliacaoStateService } from '../../services/avaliacao-state.service';
import { DisciplinaService } from '../../services/disciplina.service';
import { PerguntaService } from '../../services/pergunta.service';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { AuthService } from '../../core/auth.service';
import { CptTableMateriaComponent } from '../../components/cpt-table-materia/cpt-table-materia.component';

import { Disciplina } from '../../interfaces/Disciplina';
import { Pergunta } from '../../interfaces/Pergunta';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { Cabecalho } from '../../interfaces/Cabecalho';
import { AvaliacaoDraft } from '../../interfaces/Avaliacao';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-gerar-prova',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CptTableMateriaComponent,
  ],
  templateUrl: './pgs-gerar-prova.component.html',
  styleUrls: ['./pgs-gerar-prova.component.scss'],
})
export class PgsGerarProvaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  private avaliacaoStateService = inject(AvaliacaoStateService);
  private disciplinaService = inject(DisciplinaService);
  private perguntaService = inject(PerguntaService);
  private pdfGeneratorService = inject(PdfGeneratorService);
  private dialogService = inject(DialogService);

  public TipoProfessor = TipoProfessor;

  userProfile: Professor | null = null;
  perfilCriacao: TipoProfessor = TipoProfessor.PROFESSOR;

  currentStep = new BehaviorSubject<number>(0);
  get currentStepValue(): number {
    return this.currentStep.getValue();
  }

  avaliacaoDraft!: AvaliacaoDraft;

  disciplinasDisponiveis: Disciplina[] = [];
  todasPerguntas: Pergunta[] = [];
  professores: any[] = [];

  selectedQuestionIds: number[] = [];
  selectedDisciplines: Disciplina[] = [];
  totalPerguntasDisponiveisNoBanco = 0;
  quantidadeDesejada = 0;

  disciplinaForm!: FormGroup;
  cabecalhoForm!: FormGroup;

  minDate: string = '';
  durationOptions: string[] = [];

  constructor() {
    this.minDate = new Date().toISOString().split('T')[0];
    this.generateDurationOptions();

    effect(() => {
      const user = this.auth.currentUserSig();
      if (!user) {
        this.userProfile = null;
        this.perfilCriacao = TipoProfessor.PROFESSOR;
        this.disciplinasDisponiveis = [];
        return;
      }

      this.userProfile = user as unknown as Professor;
      this.perfilCriacao = this.userProfile.perfilProfessor;
      this.loadDisciplinasByProfile();

      if (
        this.userProfile.perfilProfessor === TipoProfessor.PROFESSOR &&
        this.currentStepValue === 0
      ) {
        this.currentStep.next(1);
      }
    });
  }

  ngOnInit(): void {
    this.avaliacaoStateService.avaliacaoDraft$.subscribe((draft) => {
      this.avaliacaoDraft = draft;
      this.syncFormWithDraft();
      this.selectedQuestionIds = (draft.questoesSelecionadas || []).map(
        (q) => q.id
      );
    });

    this.loadInitialData();
    this.initializeForms();
  }

  loadInitialData(): void {
    this.todasPerguntas = this.perguntaService.perguntas();
    this.professores = [
      { id: 1, nome: 'Prof. Gilson' },
      { id: 2, nome: 'Prof. Maria' },
    ];
  }

  initializeForms(): void {
    this.disciplinaForm = this.fb.group({
      disciplinaIds: [[] as number[], Validators.required],
      quantidadeTotal: [null, [Validators.required, Validators.min(1)]],
    });

    this.cabecalhoForm = this.fb.group({
      curso: ['', Validators.required],
      titulo: ['', Validators.required],
      turma: ['', Validators.required],
      periodo: ['', Validators.required],
      data: ['', Validators.required],
      totalPontos: ['10.0', Validators.required],
      duracao: ['', Validators.required],
    });
  }

  private generateDurationOptions() {
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
    this.durationOptions = options;
  }

  private loadDisciplinasByProfile(): void {
    if (!this.userProfile) return;
    const todas = this.disciplinaService.disciplinas();

    if (this.perfilCriacao === TipoProfessor.PROFESSOR) {
      const professor = this.userProfile as any;
      const meusIds: number[] = Array.isArray(professor.disciplinas)
        ? professor.disciplinas.map((d: any) =>
            typeof d === 'object' ? d.id : d
          )
        : [];
      this.disciplinasDisponiveis = todas.filter((d) => meusIds.includes(d.id));
    } else {
      this.disciplinasDisponiveis = todas;
    }
    this.syncFormWithDraft();
  }

  onDisciplinaSelectChange(eventOrIds: Event | number[]): void {
    let selectedIds: number[] = [];
    if (Array.isArray(eventOrIds)) {
      selectedIds = eventOrIds;
    } else {
      const target = eventOrIds.target as HTMLSelectElement;
      if (target.multiple) {
        selectedIds = Array.from(target.selectedOptions).map((o) =>
          Number(o.value)
        );
      } else {
        if (target.value) selectedIds = [Number(target.value)];
      }
    }

    const uniqueIds = Array.from(new Set(selectedIds)).map((n) => Number(n));
    this.disciplinaForm.get('disciplinaIds')?.setValue(uniqueIds);
    this.selectedDisciplines = this.disciplinasDisponiveis.filter((d) =>
      uniqueIds.includes(d.id)
    );
    this.calculateTotalAvailable(uniqueIds);
  }

  private calculateTotalAvailable(disciplineIds: number[]): void {
    this.totalPerguntasDisponiveisNoBanco = this.todasPerguntas.filter((q) =>
      disciplineIds.includes(q.disciplina.id)
    ).length;
  }

  getRangeTotalAvailable(): number[] {
    if (this.totalPerguntasDisponiveisNoBanco === 0) return [];
    const max = Math.min(this.totalPerguntasDisponiveisNoBanco, 50);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  private syncFormWithDraft(): void {
    if (!this.avaliacaoDraft) return;

    let ids: number[] = [];

    if (
      this.avaliacaoDraft.selectedDisciplinaIds &&
      this.avaliacaoDraft.selectedDisciplinaIds.length > 0
    ) {
      ids = this.avaliacaoDraft.selectedDisciplinaIds;
    } else if ((this.avaliacaoDraft as any).disciplinaId) {
      ids = [(this.avaliacaoDraft as any).disciplinaId];
    } else {
      ids =
        (this.avaliacaoDraft.questoesSelecionadas || [])
          .map((q: Pergunta) => q.disciplina.id)
          .filter((v: number, i: number, a: number[]) => a.indexOf(v) === i) ||
        [];
    }

    if (ids.length) {
      this.onDisciplinaSelectChange(ids);
    }

    if ((this.avaliacaoDraft as any).quantidadePerguntas) {
      this.disciplinaForm
        .get('quantidadeTotal')
        ?.setValue((this.avaliacaoDraft as any).quantidadePerguntas);
    }

    if (this.avaliacaoDraft.cabecalho) {
      const cab = this.avaliacaoDraft.cabecalho;

      let dataStr = '';
      if (cab.data) {
        const d = new Date(cab.data);
        if (!isNaN(d.getTime())) dataStr = d.toISOString().split('T')[0];
      }

      this.cabecalhoForm.patchValue({
        curso: cab.curso || '',
        titulo: cab.titulo || '',
        turma: cab.turma || '',
        periodo: cab.periodo || '2º Semestre de 2025',
        data: dataStr,
        totalPontos: cab.totalPontos || '10.0',
        duracao: cab.duracao || '2 horas',
      });
    }
  }

  selectProfile(perfil: TipoProfessor): void {
    this.perfilCriacao = perfil;
    this.currentStep.next(1);
    this.loadDisciplinasByProfile();
  }

  nextStep(): void {
    if (this.currentStepValue === 1) {
      if (this.disciplinaForm.invalid) {
        this.disciplinaForm.markAllAsTouched();
        return;
      }
      this.saveStep1State();
      this.currentStep.next(2);
      return;
    }
    if (this.currentStepValue === 2 && this.isSelectionComplete()) {
      this.currentStep.next(3);
      return;
    }
    if (this.currentStepValue === 3 && this.cabecalhoForm.valid) {
      this.generatePDF();
      return;
    }
  }

  saveStep1State(): void {
    const ids: number[] = this.disciplinaForm.get('disciplinaIds')?.value || [];
    this.quantidadeDesejada = Number(
      this.disciplinaForm.get('quantidadeTotal')?.value
    );
    const principalDiscId = ids.length === 1 ? ids[0] : null;
    const principalDisc = this.disciplinasDisponiveis.find(
      (d) => d.id === principalDiscId
    );

    this.avaliacaoStateService.updateState({
      disciplinaId: principalDiscId,
      disciplinaNome: principalDisc
        ? principalDisc.nome
        : 'Prova Multidisciplinar',
      isMista: ids.length > 1,
      quantidadePerguntas: this.quantidadeDesejada,
      selectedDisciplinaIds: ids,
    });

    const newSelectedQuestions = (
      this.avaliacaoDraft.questoesSelecionadas || []
    ).filter((q) => ids.includes(q.disciplina.id));

    if (newSelectedQuestions.length > this.quantidadeDesejada) {
      newSelectedQuestions.splice(this.quantidadeDesejada);
    }
    this.avaliacaoStateService.updateState({
      questoesSelecionadas: newSelectedQuestions,
    });
  }

  isGlobalLimitReached(): boolean {
    return (
      (this.avaliacaoDraft.questoesSelecionadas || []).length >=
      this.quantidadeDesejada
    );
  }

  isSelectionBlocked(): boolean {
    return this.isGlobalLimitReached();
  }

  toggleQuestao(q: Pergunta): void {
    const questoes = this.avaliacaoDraft.questoesSelecionadas || [];
    const index = questoes.findIndex((x) => x.id === q.id);
    if (index > -1) {
      questoes.splice(index, 1);
    } else if (!this.isGlobalLimitReached()) {
      questoes.push(q);
    }
    this.avaliacaoDraft.questoesSelecionadas = questoes;
    this.avaliacaoStateService.updateState({
      questoesSelecionadas: [...questoes],
    });
  }

  isSelectionComplete(): boolean {
    return (
      (this.avaliacaoDraft.questoesSelecionadas || []).length ===
      this.quantidadeDesejada
    );
  }

  getQuestionsCountForDiscipline(id: number): number {
    return (this.avaliacaoDraft.questoesSelecionadas || []).filter(
      (q) => q.disciplina.id === id
    ).length;
  }

  saveCabecalhoState(): void {
    if (!this.cabecalhoForm) return;
    const val = this.cabecalhoForm.value;

    const nomeProfessor = this.userProfile?.nome || 'Professor';
    let nomeDisciplina = '';
    if (this.perfilCriacao === TipoProfessor.COORDENADOR) {
      nomeDisciplina = 'Prova Geral';
    } else {
      nomeDisciplina = this.avaliacaoDraft.disciplinaNome || 'Disciplina';
    }

    const cabData: Partial<Cabecalho> = {
      curso: val.curso,
      titulo: val.titulo,
      turma: val.turma,
      periodo: val.periodo,
      totalPontos: val.totalPontos,
      duracao: val.duracao,
      data: val.data ? new Date(val.data) : new Date(),
      professor: nomeProfessor,
      disciplina: nomeDisciplina,
    };

    this.avaliacaoStateService.updateCabecalho(cabData);
  }

  generatePDF(): void {
    this.saveCabecalhoState();
    const finalDraft = this.avaliacaoStateService.getCurrentState();

    this.dialogService
      .confirmAction({
        title: 'Gerar PDF',
        message:
          'Tem certeza que deseja finalizar e gerar o arquivo PDF da prova?',
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
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.avaliacaoStateService.clearState();
          this.currentStep.next(
            this.userProfile?.perfilProfessor === TipoProfessor.COORDENADOR
              ? 0
              : 1
          );
        }
      });
  }

  cancelarProva(): void {
    this.dialogService
      .confirmAction({
        title: 'Cancelar Prova',
        message:
          'Você tem certeza que deseja cancelar a criação desta prova? Todas as seleções serão perdidas.',
        confirmButtonText: 'Sim, Cancelar',
        cancelButtonText: 'Voltar',
        titleColor: '#c62828',
        action: () => {
          return of(true).pipe(
            delay(500),
            tap(() => {
              this.avaliacaoStateService.clearState();
              this.initializeForms();
            })
          );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.currentStep.next(
            this.userProfile?.perfilProfessor === TipoProfessor.COORDENADOR
              ? 0
              : 1
          );
        }
      });
  }

  cancelarSelecaoDisciplina(): void {
    this.dialogService
      .confirmAction({
        title: 'Voltar ao Início',
        message:
          'Deseja cancelar a seleção atual e voltar para a escolha de disciplinas?',
        confirmButtonText: 'Voltar',
        cancelButtonText: 'Continuar Aqui',
        titleColor: '#c62828',
        action: () => {
          return of(true).pipe(
            delay(300),
            tap(() => {
              this.avaliacaoStateService.clearState();
              this.initializeForms();
            })
          );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.currentStep.next(1);
        }
      });
  }
}
