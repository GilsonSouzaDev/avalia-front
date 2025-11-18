import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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

import { Disciplina } from '../../interfaces/Disciplina';
import { Pergunta } from '../../interfaces/Pergunta';

import { CptTableMateriaComponent } from '../../components/cpt-table-materia/cpt-table-materia.component';
import { AuthService } from '../../core/auth.service';
import { TipoProfessor } from '../../interfaces/Professor';

@Component({
  selector: 'app-gerar-prova',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CptTableMateriaComponent],
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

  // 🔥 Agora perfil é real, vindo do AuthService
  userProfile: {
    id: number;
    nome: string;
    perfil: TipoProfessor;
  } | null = null;

  perfilCriacao: TipoProfessor = TipoProfessor.PROFESSOR;

  // Controla o step do wizard
  currentStep = new BehaviorSubject<number>(0);
  get currentStepValue(): number {
    return this.currentStep.getValue();
  }

  // IDs de questões
  get selectedQuestionIds(): number[] {
    return this.avaliacaoDraft?.questoesSelecionadas?.map((q) => q.id) ?? [];
  }

  avaliacaoDraft!: AvaliacaoDraft;

  disciplinas: Disciplina[] = [];
  todasPerguntas: Pergunta[] = [];
  professores: any[] = [];

  disciplinaForm!: FormGroup;
  cabecalhoForm!: FormGroup;

  selectedDisciplines: Disciplina[] = [];

  constructor() {
    // 🔥 Efeito para atualizar perfil automaticamente quando logado
    effect(() => {
      const user = this.auth.currentUserSig();

      if (!user) return;

      this.userProfile = {
        id: user.id,
        nome: user.nome,
        perfil: user.tipo,
      };

      // Perfil da criação da prova
      this.perfilCriacao = user.tipo;

      // Se professor → pula o passo de seleção de perfil
      if (
        user.tipo === TipoProfessor.PROFESSOR &&
        this.currentStepValue === 0
      ) {
        this.currentStep.next(1);
      }
    });
  }

  ngOnInit(): void {
    this.avaliacaoStateService.avaliacaoDraft$.subscribe((draft) => {
      this.avaliacaoDraft = draft;
      this.updateSelectedDisciplines();
    });

    this.loadInitialData();
    this.initializeForms();
  }

  loadInitialData(): void {
    this.disciplinas = this.disciplinaService.disciplinas();
    this.todasPerguntas = this.perguntaService.perguntas();

    // Se precisar listar professores de verdade, mova isso para um service futuro
    this.professores = [
      { id: 1, nome: 'Prof. Gilson' },
      { id: 2, nome: 'Prof. Maria' },
    ];
  }

  initializeForms(): void {
    const initialDiscIds = this.avaliacaoDraft.disciplinaId
      ? [this.avaliacaoDraft.disciplinaId]
      : [];

    this.disciplinaForm = this.fb.group({
      disciplinaIds: [initialDiscIds, Validators.required],
    });

    if (this.avaliacaoDraft.disciplinaId) {
      this.addQuestionCountControl(this.avaliacaoDraft.disciplinaId);
    }

    this.cabecalhoForm = this.fb.group({
      titulo: [this.avaliacaoDraft.cabecalho.titulo, Validators.required],
      turma: [this.avaliacaoDraft.cabecalho.turma, Validators.required],
      data: [
        this.formatDate(this.avaliacaoDraft.cabecalho.data),
        Validators.required,
      ],
    });
  }

  selectProfile(perfil: TipoProfessor): void {
    this.perfilCriacao = perfil;
    this.currentStep.next(1);
  }

  nextStep(): void {
    if (this.currentStepValue === 1 && this.disciplinaForm.valid) {
      this.saveStep1State();
      this.currentStep.next(2);
    } else if (this.currentStepValue === 2 && this.isSelectionComplete()) {
      this.currentStep.next(3);
    } else if (this.currentStepValue === 3 && this.cabecalhoForm.valid) {
      this.generatePDF();
    }
  }

  getFilteredDisciplines(): Disciplina[] {
    return this.disciplinas;
  }

  isDisciplineSelected(id: number): boolean {
    return (this.disciplinaForm.get('disciplinaIds')?.value || []).includes(id);
  }

  isDisciplineSelectable(id: number): boolean {
    const ids = this.disciplinaForm.get('disciplinaIds')?.value || [];
    if (this.perfilCriacao === TipoProfessor.PROFESSOR) {
      return ids.length === 0 || ids.includes(id);
    }
    return true;
  }

  onDisciplineChange(disc: Disciplina, event: any): void {
    const checked = event.target.checked;
    let ids = this.disciplinaForm.get('disciplinaIds')?.value || [];

    if (this.perfilCriacao === TipoProfessor.PROFESSOR) {
      ids = checked ? [disc.id] : [];
      this.selectedDisciplines.forEach((d) => {
        if (d.id !== disc.id) this.removeQuestionCountControl(d.id);
      });
      if (checked) this.addQuestionCountControl(disc.id);
    } else {
      ids = checked
        ? [...ids, disc.id]
        : ids.filter((x: number) => x !== disc.id);
      if (checked) this.addQuestionCountControl(disc.id);
      else this.removeQuestionCountControl(disc.id);
    }

    this.disciplinaForm.get('disciplinaIds')?.setValue(ids);
    this.updateSelectedDisciplines();
  }

  updateSelectedDisciplines(): void {
    const ids = this.disciplinaForm.get('disciplinaIds')?.value || [];
    this.selectedDisciplines = this.disciplinas.filter((d) =>
      ids.includes(d.id)
    );
  }

  addQuestionCountControl(id: number): void {
    const key = 'count_' + id;
    if (!this.disciplinaForm.contains(key)) {
      this.disciplinaForm.addControl(
        key,
        this.fb.control(null, [Validators.required])
      );
    }
  }

  removeQuestionCountControl(id: number): void {
    const key = 'count_' + id;
    if (this.disciplinaForm.contains(key)) {
      this.disciplinaForm.removeControl(key);
    }
  }

  getAvailableQuestions(id: number): number {
    return this.todasPerguntas.filter((q) => q.disciplinaId === id).length;
  }

  getQuestionCounts(id: number): number[] {
    const max = this.getAvailableQuestions(id);
    const r: number[] = [];
    for (let i = 5; i <= max; i += 5) r.push(i);
    return r;
  }

  saveStep1State(): void {
    const ids: number[] = this.disciplinaForm.value.disciplinaIds;
    const discId = ids.length === 1 ? ids[0] : null;

    this.avaliacaoStateService.updateState({
      disciplinaId: discId,
      disciplinaNome: discId
        ? this.disciplinas.find((d) => d.id === discId)?.nome ?? ''
        : 'Mista',
      isMista:
        this.perfilCriacao === TipoProfessor.COORDENADOR && ids.length > 1,
      quantidadePerguntas: this.totalQuestionsToSelect(),
    });
  }

  totalQuestionsToSelect(): number {
    return this.selectedDisciplines
      .map((d) => this.disciplinaForm.get('count_' + d.id)?.value || 0)
      .reduce((a, b) => a + b, 0);
  }

  getQuestionsCountForDiscipline(id: number): number {
    return this.disciplinaForm.get('count_' + id)?.value || 0;
  }

  isDisciplineLimitReached(id: number): boolean {
    const required = this.getQuestionsCountForDiscipline(id);
    const current = this.avaliacaoDraft.questoesSelecionadas.filter(
      (q) => q.disciplinaId === id
    ).length;
    return current >= required;
  }

  toggleQuestao(q: Pergunta): void {
    const index = this.avaliacaoDraft.questoesSelecionadas.findIndex(
      (x) => x.id === q.id
    );

    const limit = this.getQuestionsCountForDiscipline(q.disciplinaId);
    const count = this.avaliacaoDraft.questoesSelecionadas.filter(
      (x) => x.disciplinaId === q.disciplinaId
    ).length;

    if (index > -1) {
      this.avaliacaoDraft.questoesSelecionadas.splice(index, 1);
    } else if (count < limit) {
      this.avaliacaoDraft.questoesSelecionadas.push(q);
    }

    this.avaliacaoStateService.updateState({
      questoesSelecionadas: [...this.avaliacaoDraft.questoesSelecionadas],
    });
  }

  isSelectionComplete(): boolean {
    return (
      this.avaliacaoDraft.questoesSelecionadas.length ===
      this.totalQuestionsToSelect()
    );
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  saveCabecalhoState(): void {
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
          this.userProfile?.perfil === TipoProfessor.COORDENADOR ? 0 : 1
        );
      })
      .catch(() => alert('Erro ao gerar o PDF.'));
  }

  cancelarProva(): void {
    if (confirm('Cancelar prova e limpar tudo?')) {
      this.avaliacaoStateService.clearState();
      this.initializeForms();
      this.currentStep.next(
        this.userProfile?.perfil === TipoProfessor.COORDENADOR ? 0 : 1
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
