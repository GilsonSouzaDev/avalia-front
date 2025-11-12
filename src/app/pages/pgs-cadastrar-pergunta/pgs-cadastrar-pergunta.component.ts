import { Component } from '@angular/core';
import { CptPerguntaFormsComponent } from "../../components/cpt-pergunta-forms/cpt-pergunta-forms.component";
import { Disciplina } from '../../interfaces/Disciplina';
import { MOCK_DISCIPLINAS, MockDataService } from '../../data/mock-data';

@Component({
  selector: 'app-pgs-cadastrar-pergunta',
  imports: [CptPerguntaFormsComponent],
  templateUrl: './pgs-cadastrar-pergunta.component.html',
  styleUrl: './pgs-cadastrar-pergunta.component.scss'
})
export class PgsCadastrarPerguntaComponent {


    disciplinas = MOCK_DISCIPLINAS;


}
