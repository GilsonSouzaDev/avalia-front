import { Component, inject } from '@angular/core';
import { CptCardResumoComponent } from "../../components/cpt-card-resumo/cpt-card-resumo.component";
import { CptCardMateriaComponent } from "../../components/cpt-card-materia/cpt-card-materia.component";
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { Professor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import { contarPerguntasPorDisciplinaEProfessorEspecifico } from '../../utils/perguntas-filter-util';
import { MOCK_DISCIPLINAS } from '../../data/mock-data';

@Component({
  selector: 'app-pgs-dashboard',
  imports: [CptCardResumoComponent, CptCardMateriaComponent],
  templateUrl: './pgs-dashboard.component.html',
  styleUrl: './pgs-dashboard.component.scss',
})
export class PgsDashboardComponent {

  disciplinas = MOCK_DISCIPLINAS;

  private authService = inject(AuthService);

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
}
