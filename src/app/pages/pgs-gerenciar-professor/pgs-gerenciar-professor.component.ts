import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes Filhos
import { CptProfessorTableComponent } from '../../components/cpt-professor-table/cpt-professor-table.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';

// Interfaces e Utils
import { Professor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import {
  contarPerguntasPorDisciplinaEProfessorEspecifico,
  filtrarDisciplinasPorPerfil,
} from '../../utils/disicplina-filter-util';

// Services (Onde a mágica acontece)
import { ProfessorService } from '../../services/professor.service';
import { DisciplinaService } from '../../services/disciplina.service';
import { PerguntaService } from '../../services/pergunta.service';
import { AuthService } from '../../core/auth.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pgs-gerenciar-professor',
  standalone: true,
  imports: [
    CptProfessorTableComponent,
    CptProfessorFormsComponent,
    CommonModule,
  ],
  templateUrl: './pgs-gerenciar-professor.component.html',
})
export class PgsGerenciarProfessorComponent {
  // Injeção de Serviços
  private authService = inject(AuthService);
  private professorService = inject(ProfessorService);
  private disciplinaService = inject(DisciplinaService);
  private perguntaService = inject(PerguntaService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  modoCadastro = signal(false);
  professorParaEdicao = signal<Professor | null>(null);

  professores = this.professorService.professores;
  disciplinas = this.disciplinaService.disciplinas;
  perguntas = this.perguntaService.perguntas;


  abrirCadastro() {
    this.professorParaEdicao.set(null);
    this.modoCadastro.set(true);
  }

  fecharCadastro() {
    this.modoCadastro.set(false);
    this.professorParaEdicao.set(null);
  }


  handleSalvarProfessor(professor: Professor) {
    const { id, ...professorParaSalvar } = professor;
    console.log(professorParaSalvar);

    this.dialogService
      .confirmAction({
        title: 'Cadastrar Professor',
        message: 'Tem certeza que deseja cadastrar este novo professor?',
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        titleColor: '#2e7d32',
        action: () =>
          this.professorService.add(professorParaSalvar as Professor),
      })
      .afterClosed()
      .subscribe((success) => {
        if (success) {
          this.fecharCadastro();
        }
      });
  }


  handleEditarProfessor(professor: Professor) {
    this.professorParaEdicao.set(professor);
    this.modoCadastro.set(true);
  }


  quantidadeQuestoes = (professor: Professor) => {
    const todasPerguntas = this.perguntas(); // Pega valor atual do signal
    return todasPerguntas.filter((p) => p.codigoProfessor === professor.codigo)
      .length;
  };


  quantidadeMaterias = (professor: Professor) => {
    return professor.disciplinas?.length ?? 0;
  };

  get usuario(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas(), this.usuario);
  }

  contarPerguntasNaDisciplina(
    disciplina: Disciplina,
    usuario: Professor | null | undefined
  ): number {
    if (!usuario) return 0;

    return contarPerguntasPorDisciplinaEProfessorEspecifico(
      disciplina.id,
      usuario,
      this.perguntas()
    );
  }

  contarPerguntasGerais(): number {
    return this.perguntas().length;
  }
}
