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
import { BehaviorSubject } from 'rxjs';

import {
  AvaliacaoStateService,
} from '../../services/avaliacao-state.service';
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
      this.perfilCriacao = this.userProfile.tipo;
      this.loadDisciplinasByProfile();

      if (
        this.userProfile.tipo === TipoProfessor.PROFESSOR &&
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
    let minutes = 30;
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
      disciplineIds.includes(q.disciplinaId)
    ).length;
  }

  getRangeTotalAvailable(): number[] {
    if (this.totalPerguntasDisponiveisNoBanco === 0) return [];
    const max = Math.min(this.totalPerguntasDisponiveisNoBanco, 50);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // --- CORREÇÃO CRÍTICA: syncFormWithDraft ---
  // Agora prioriza a lista 'selectedDisciplinaIds' salva, em vez de adivinhar pelas perguntas
  private syncFormWithDraft(): void {
    if (!this.avaliacaoDraft) return;

    let ids: number[] = [];

    // 1. Tenta recuperar a lista exata salva no passo 1
    if (
      this.avaliacaoDraft.selectedDisciplinaIds &&
      this.avaliacaoDraft.selectedDisciplinaIds.length > 0
    ) {
      ids = this.avaliacaoDraft.selectedDisciplinaIds;
    }
    // 2. Fallback para disciplina única (legado ou modo professor simples)
    else if ((this.avaliacaoDraft as any).disciplinaId) {
      ids = [(this.avaliacaoDraft as any).disciplinaId];
    }
    // 3. Último recurso: recupera das perguntas (apenas se não tiver a lista acima)
    else {
      ids =
        (this.avaliacaoDraft.questoesSelecionadas || [])
          .map((q: Pergunta) => q.disciplinaId)
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

    // Sync Cabeçalho
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

  // --- CORREÇÃO CRÍTICA: saveStep1State ---
  // Salva explicitamente a lista de IDs no campo novo 'selectedDisciplinaIds'
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
      selectedDisciplinaIds: ids, // <--- AQUI: Salva a seleção para não perder depois
    });

    const newSelectedQuestions = (
      this.avaliacaoDraft.questoesSelecionadas || []
    ).filter((q) => ids.includes(q.disciplinaId));

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
      (q) => q.disciplinaId === id
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
    this.pdfGeneratorService
      .generatePdf(finalDraft)
      .then(() => {
        alert('PDF gerado com sucesso!');
        this.avaliacaoStateService.clearState();
        this.currentStep.next(
          this.userProfile?.tipo === TipoProfessor.COORDENADOR ? 0 : 1
        );
      })
      .catch(() => alert('Erro ao gerar o PDF.'));
  }

  cancelarProva(): void {
    if (confirm('Cancelar prova e limpar tudo?')) {
      this.avaliacaoStateService.clearState();
      this.initializeForms();
      this.currentStep.next(
        this.userProfile?.tipo === TipoProfessor.COORDENADOR ? 0 : 1
      );
    }
  }

  cancelarSelecaoDisciplina(): void {
    if (confirm('Cancelar seleção de disciplina?')) {
      this.avaliacaoStateService.clearState();
      this.initializeForms();
      this.currentStep.next(1);
    }
  }
}
