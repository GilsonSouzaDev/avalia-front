import { Component, inject } from '@angular/core';
import { CptPerguntaFormsComponent } from "../../components/cpt-pergunta-forms/cpt-pergunta-forms.component";
import { Disciplina } from '../../interfaces/Disciplina';
import { MOCK_DISCIPLINAS, MockDataService } from '../../data/mock-data';
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';

@Component({
  selector: 'app-pgs-cadastrar-pergunta',
  imports: [CptPerguntaFormsComponent],
  templateUrl: './pgs-cadastrar-pergunta.component.html',
  styleUrl: './pgs-cadastrar-pergunta.component.scss',
})
export class PgsCadastrarPerguntaComponent {


  disciplinas = MOCK_DISCIPLINAS;

  private authService = inject(AuthService);

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }
}
