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
  AvaliacaoDraft,
} from '../../services/avaliacao-state.service';
import { DisciplinaService } from '../../services/disciplina.service';
import { PerguntaService } from '../../services/pergunta.service';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { AuthService } from '../../core/auth.service';
import { CptTableMateriaComponent } from '../../components/cpt-table-materia/cpt-table-materia.component';

import { Disciplina } from '../../interfaces/Disciplina';
import { Pergunta } from '../../interfaces/Pergunta';
import { Professor, TipoProfessor } from '../../interfaces/Professor';

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

  disciplinaForm!: FormGroup;
  cabecalhoForm!: FormGroup;

  // Variáveis de controle simplificadas
  selectedDisciplines: Disciplina[] = [];
  totalPerguntasDisponiveisNoBanco = 0; // Soma de tudo que foi selecionado
  quantidadeDesejada = 0; // O que o usuário escolheu no select único

  constructor() {
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
    // Agora o form tem apenas IDs e a Quantidade Total
    this.disciplinaForm = this.fb.group({
      disciplinaIds: [[] as number[], Validators.required],
      quantidadeTotal: [null, [Validators.required, Validators.min(1)]],
    });

    this.cabecalhoForm = this.fb.group({
      titulo: ['', Validators.required],
      turma: ['', Validators.required],
      data: ['', Validators.required],
    });
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

    // Filtra os objetos disciplina
    this.selectedDisciplines = this.disciplinasDisponiveis.filter((d) =>
      uniqueIds.includes(d.id)
    );

    // Calcula o total disponível no banco para essas disciplinas
    this.calculateTotalAvailable(uniqueIds);
  }

  // Calcula quantas questões existem no total para as disciplinas escolhidas
  private calculateTotalAvailable(disciplineIds: number[]): void {
    this.totalPerguntasDisponiveisNoBanco = this.todasPerguntas.filter((q) =>
      disciplineIds.includes(q.disciplinaId)
    ).length;

    // Se a quantidade selecionada anteriormente for maior que o novo total disponível, reseta
    const currentQtd = this.disciplinaForm.get('quantidadeTotal')?.value;
    if (currentQtd && currentQtd > this.totalPerguntasDisponiveisNoBanco) {
      this.disciplinaForm.get('quantidadeTotal')?.setValue(null);
    }
  }

  // Gera o array para o <select> de quantidade (ex: [1, 2, ... 20])
  getRangeTotalAvailable(): number[] {
    if (this.totalPerguntasDisponiveisNoBanco === 0) return [];
    // Limita o select a 50 ou o total disponível, o que for menor
    const max = Math.min(this.totalPerguntasDisponiveisNoBanco, 50);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  private syncFormWithDraft(): void {
    if (!this.avaliacaoDraft) return;

    // Sync Disciplinas
    const discId = (this.avaliacaoDraft as any).disciplinaId;
    let ids: number[] = [];

    if (discId) {
      ids = [discId];
    } else {
      ids =
        (this.avaliacaoDraft.questoesSelecionadas || [])
          .map((q: Pergunta) => q.disciplinaId)
          .filter((v: number, i: number, a: number[]) => a.indexOf(v) === i) ||
        [];
    }

    if (ids.length) {
      this.onDisciplinaSelectChange(ids);
    }

    // Sync Quantidade
    if ((this.avaliacaoDraft as any).quantidadePerguntas) {
      this.disciplinaForm
        .get('quantidadeTotal')
        ?.setValue((this.avaliacaoDraft as any).quantidadePerguntas);
    }

    // Sync Cabeçalho
    if (this.avaliacaoDraft.cabecalho) {
      this.cabecalhoForm.patchValue({
        titulo: this.avaliacaoDraft.cabecalho.titulo ?? '',
        turma: this.avaliacaoDraft.cabecalho.turma ?? '',
        data: this.formatDate(this.avaliacaoDraft.cabecalho.data) ?? '',
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
    });

    // Remove questões que não pertencem mais às disciplinas selecionadas
    const newSelectedQuestions = (
      this.avaliacaoDraft.questoesSelecionadas || []
    ).filter((q) => ids.includes(q.disciplinaId));

    // Se após filtrar, tivermos mais questões que o novo limite, cortamos o excesso
    if (newSelectedQuestions.length > this.quantidadeDesejada) {
      newSelectedQuestions.splice(this.quantidadeDesejada);
    }

    this.avaliacaoStateService.updateState({
      questoesSelecionadas: newSelectedQuestions,
    });
  }

  // Verifica se o Limite GLOBAL foi atingido
  isGlobalLimitReached(): boolean {
    const currentCount = (this.avaliacaoDraft.questoesSelecionadas || [])
      .length;
    return currentCount >= this.quantidadeDesejada;
  }

  // Função para passar para o componente filho (table)
  // Agora retorna true se o limite GLOBAL foi atingido, independente da disciplina
  isSelectionBlocked(): boolean {
    return this.isGlobalLimitReached();
  }

  toggleQuestao(q: Pergunta): void {
    const questoes = this.avaliacaoDraft.questoesSelecionadas || [];
    const index = questoes.findIndex((x) => x.id === q.id);

    // Se já existe, remove
    if (index > -1) {
      questoes.splice(index, 1);
    }
    // Se não existe, verifica o limite GLOBAL antes de adicionar
    else if (!this.isGlobalLimitReached()) {
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
    // Apenas helper visual para mostrar quantas desta disciplina foram selecionadas
    return (this.avaliacaoDraft.questoesSelecionadas || []).filter(
      (q) => q.disciplinaId === id
    ).length;
  }

  // ... (getAvailableQuestions helpers, formatDate, saveCabecalhoState, generatePDF, cancel functions - MANTIDOS)

  getAvailableQuestions(discId: number): number {
    return this.todasPerguntas.filter((q) => q.disciplinaId === discId).length;
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  saveCabecalhoState(): void {
    if (!this.cabecalhoForm) return;
    const value = this.cabecalhoForm.value;
    this.avaliacaoStateService.updateCabecalho({
      titulo: value.titulo,
      turma: value.turma,
      data: new Date(value.data),
    });
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
