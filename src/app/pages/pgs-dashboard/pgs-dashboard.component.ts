import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CptCardResumoComponent } from '../../components/cpt-card-resumo/cpt-card-resumo.component';
import { CptCardMateriaComponent } from '../../components/cpt-card-materia/cpt-card-materia.component';
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { contarPerguntasPorDisciplinaEProfessorEspecifico } from '../../utils/perguntas-filter-util';
import { MOCK_DISCIPLINAS, MOCK_PROFESSORES } from '../../data/mock-data';
import { Professor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';

@Component({
  selector: 'app-pgs-dashboard',
  standalone: true,
  imports: [CommonModule, CptCardResumoComponent, CptCardMateriaComponent],
  templateUrl: './pgs-dashboard.component.html',
  styleUrls: ['./pgs-dashboard.component.scss'],
})
export class PgsDashboardComponent {

  private authService = inject(AuthService);

  // ---- Dados base ----
  disciplinas = MOCK_DISCIPLINAS;
  professores = MOCK_PROFESSORES;

  // ---- Indicadores ----
  disciplinasLecionadas = 0;
  perguntasLecionadas = 0;
  totalProfessores = 0;
  totalPerguntas = 0;
  totalDisciplinas = 0;

  constructor() {
    const usuario = this.usuario;
    this.totalProfessores = this.professores.length;
    this.totalDisciplinas = this.disciplinas.length;
    this.totalPerguntas = this.contarPerguntasGerais();

    if (usuario) {
      this.disciplinasLecionadas = usuario.disciplinas?.length || 0;
      this.perguntasLecionadas =
        this.contarPerguntasDasDisciplinasLecionadas(usuario);
    }
  }

  // ---- Getter do usuário logado ----
  get usuario(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  // ---- Disciplinas filtradas por perfil ----
  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }

  // ---- Contagem de perguntas ----
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
