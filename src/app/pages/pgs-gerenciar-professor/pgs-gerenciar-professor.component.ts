import { Component, inject, signal } from '@angular/core';
import { CptProfessorTableComponent } from '../../components/cpt-professor-table/cpt-professor-table.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { Professor } from '../../interfaces/Professor';
import { MOCK_DISCIPLINAS, MOCK_PROFESSORES } from '../../data/mock-data';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { contarPerguntasPorDisciplinaEProfessorEspecifico, filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { Disciplina } from '../../interfaces/Disciplina';

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
  modoCadastro = signal(false);
  professores = MOCK_PROFESSORES;
  disciplinas = MOCK_DISCIPLINAS;

  private authService = inject(AuthService);

  abrirCadastro() {
    this.modoCadastro.set(true);
  }

  fecharCadastro() {
    this.modoCadastro.set(false);
  }

  // ---- Indicadores ----
  quantidadeQuestoes = (professor: any) =>
    this.contarPerguntasDasDisciplinasLecionadas(professor);

  quantidadeMaterias = (professor: any) => professor.disciplinas?.length ?? 0;


  get usuario(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }

  contarPerguntasNaDisciplina(
    disciplina: Disciplina,
    usuario: Professor | null | undefined
  ): number {
    return contarPerguntasPorDisciplinaEProfessorEspecifico(
      disciplina,
      usuario
    );
  }

  // ---- Total geral de perguntas (todas as disciplinas) ----
  contarPerguntasGerais(): number {
    return this.disciplinas.reduce(
      (total, disc) => total + (disc.perguntas?.length || 0),
      0
    );
  }

  // ---- Total de perguntas só das matérias lecionadas pelo professor ----
  contarPerguntasDasDisciplinasLecionadas(usuario: Professor): number {
    const disciplinasLecionadas = this.disciplinas.filter((d) =>
      usuario.disciplinas.some((disc) => disc.id === d.id)
    );
    return disciplinasLecionadas.reduce((total, d) => {
      const perguntasDoProfessor = (d.perguntas || []).filter(
        (p) => p.codigoProfessor === usuario.codigo
      );
      return total + perguntasDoProfessor.length;
    }, 0);
  }
}


