import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { AvaliacaoStateService } from '../../services/avaliacao-state.service';
import { DisciplinaService } from '../../services/disciplina.service';
import { PerguntaService } from '../../services/pergunta.service';
import { AuthService } from '../../core/auth.service';
import { ProfessorService } from '../../services/professor.service';
import { GerarProvaManagerService } from '../../services/gerar-prova-manager.service';
import { CptTableMateriaComponent } from '../../components/cpt-table-materia/cpt-table-materia.component';

import { Disciplina } from '../../interfaces/Disciplina';
import { Pergunta } from '../../interfaces/Pergunta';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { AvaliacaoDraft } from '../../interfaces/Avaliacao';

@Component({
  selector: 'app-gerar-prova',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CptTableMateriaComponent],
  templateUrl: './pgs-gerar-prova.component.html',
  styleUrls: ['./pgs-gerar-prova.component.scss'],
  providers: [GerarProvaManagerService] 
})
export class PgsGerarProvaComponent implements OnInit {
  private manager = inject(GerarProvaManagerService);
  private auth = inject(AuthService);
  private avaliacaoState = inject(AvaliacaoStateService);
  private disciplinaService = inject(DisciplinaService);
  private perguntaService = inject(PerguntaService);
  private professorService = inject(ProfessorService);

  public TipoProfessor = TipoProfessor;

  currentStep = new BehaviorSubject<number>(0);
  
  get currentStepValue(): number {
    return this.currentStep.getValue();
  }

  disciplinaForm!: FormGroup;
  cabecalhoForm!: FormGroup;
  minDate = new Date().toISOString().split('T')[0];
  durationOptions: string[] = [];

  userProfile: Professor | null = null;
  perfilCriacao: TipoProfessor = TipoProfessor.PROFESSOR;
  
  // CORREÇÃO: Inicializa como null para validar o uso de '?' no HTML e evitar erros de startup
  avaliacaoDraft: AvaliacaoDraft | null = null;
  
  disciplinasDisponiveis: Disciplina[] = [];
  todasPerguntas: Pergunta[] = [];
  professores: any[] = [];
  
  selectedDisciplines: Disciplina[] = [];
  selectedQuestionIds: number[] = [];
  totalPerguntasDisponiveisNoBanco = 0;
  quantidadeDesejada = 0;

  constructor() {
    this.durationOptions = this.manager.generateDurationOptions();
    this.disciplinaForm = this.manager.createDisciplinaForm();
    this.cabecalhoForm = this.manager.createCabecalhoForm();

    effect(() => {
      const user = this.auth.currentUserSig();
      if (!user) {
        this.resetUserContext();
        return;
      }
      this.setupUserContext(user as unknown as Professor);
    });
  }

  ngOnInit(): void {
    this.todasPerguntas = this.perguntaService.perguntas();
    this.professores = this.professorService.professores();

    this.avaliacaoState.avaliacaoDraft$.subscribe((draft) => {
      this.avaliacaoDraft = draft;
      // Garante array vazio se for null/undefined
      this.selectedQuestionIds = (draft?.questoesSelecionadas || []).map(q => q.id);
      
      const ids = this.manager.syncFormWithDraft(draft, this.disciplinaForm, this.cabecalhoForm);
      if (ids.length) this.updateDisciplineSelection(ids);
    });
  }

  private resetUserContext() {
    this.userProfile = null;
    this.perfilCriacao = TipoProfessor.PROFESSOR;
    this.disciplinasDisponiveis = [];
  }

  private setupUserContext(user: Professor) {
    this.userProfile = user;
    this.perfilCriacao = user.perfilProfessor;
    
    this.disciplinasDisponiveis = this.manager.filterDisciplinas(
      user, 
      this.disciplinaService.disciplinas(),
      this.perfilCriacao
    );

    if (user.perfilProfessor === TipoProfessor.PROFESSOR && this.currentStep.value === 0) {
      this.currentStep.next(1);
    }
  }

  selectProfile(perfil: TipoProfessor): void {
    this.perfilCriacao = perfil;
    this.currentStep.next(1);
    
    if (this.userProfile) {
        this.disciplinasDisponiveis = this.manager.filterDisciplinas(
            this.userProfile, 
            this.disciplinaService.disciplinas(),
            perfil
        );
    }
  }

  onDisciplinaSelectChange(eventOrIds: any): void {
    let ids: number[] = Array.isArray(eventOrIds) ? eventOrIds : [];
    
    if (!Array.isArray(eventOrIds) && eventOrIds.target) {
      const select = eventOrIds.target as HTMLSelectElement;
      ids = Array.from(select.selectedOptions).map(o => Number(o.value));
    }

    this.disciplinaForm.get('disciplinaIds')?.setValue(ids);
    this.updateDisciplineSelection(ids);
  }

  private updateDisciplineSelection(ids: number[]) {
    this.selectedDisciplines = this.disciplinasDisponiveis.filter(d => ids.includes(d.id));
    this.totalPerguntasDisponiveisNoBanco = this.manager.calculateAvailableQuestions(ids, this.todasPerguntas);
  }

  getRangeTotalAvailable(): number[] {
    if (!this.totalPerguntasDisponiveisNoBanco) return [];
    return Array.from({ length: Math.min(this.totalPerguntasDisponiveisNoBanco, 50) }, (_, i) => i + 1);
  }

  nextStep(): void {
    const step = this.currentStep.value;

    // Se o draft for nulo, não permite avançar (segurança extra)
    if (!this.avaliacaoDraft) return;

    if (step === 1) {
      if (this.disciplinaForm.invalid) {
        this.disciplinaForm.markAllAsTouched();
        return;
      }
      this.quantidadeDesejada = Number(this.disciplinaForm.get('quantidadeTotal')?.value);
      this.manager.saveStep1(this.disciplinaForm, this.avaliacaoDraft, this.disciplinasDisponiveis);
      this.currentStep.next(2);
    } 
    else if (step === 2 && this.isSelectionComplete()) {
      this.currentStep.next(3);
    } 
    else if (step === 3 && this.cabecalhoForm.valid) {
      this.generatePDF();
    }
  }

  toggleQuestao(q: Pergunta): void {
    if (this.isSelectionBlocked() && !this.selectedQuestionIds.includes(q.id)) return;
    
    // Verificação de segurança: só chama o manager se o draft existir
    if (this.avaliacaoDraft) {
      this.manager.toggleQuestao(q, this.avaliacaoDraft, this.quantidadeDesejada);
    }
  }

  isSelectionComplete(): boolean {
    return (this.avaliacaoDraft?.questoesSelecionadas || []).length === this.quantidadeDesejada;
  }

  isSelectionBlocked(): boolean {
    return this.isSelectionComplete();
  }

  getQuestionsCountForDiscipline(id: number): number {
    return (this.avaliacaoDraft?.questoesSelecionadas || []).filter(q => q.disciplina.id === id).length;
  }

  generatePDF(): void {
    if (!this.avaliacaoDraft) return;
    this.manager.saveCabecalho(this.cabecalhoForm, this.userProfile, this.avaliacaoDraft, this.perfilCriacao);
    this.manager.confirmAndGeneratePDF(() => this.resetNavigation());
  }

  cancelarProva(): void {
    this.manager.confirmCancelProva(() => {
       this.disciplinaForm.reset();
       this.cabecalhoForm.reset();
       this.resetNavigation();
    });
  }

  cancelarSelecaoDisciplina(): void {
    this.manager.confirmCancelSelecao(() => {
      this.disciplinaForm.reset();
      this.currentStep.next(1);
    });
  }

  private resetNavigation(): void {
    this.currentStep.next(this.userProfile?.perfilProfessor === TipoProfessor.COORDENADOR ? 0 : 1);
  }
}