import { Component } from '@angular/core';
import { CptListMateriaComponent } from "../../components/cpt-list-materia/cpt-list-materia.component";
import { Disciplina } from '../../interfaces/Disciplina';
import { DISCIPLINAS_MOCK } from '../../data/disciplina';

@Component({
  selector: 'app-pgs-list-disciplina',
  imports: [CptListMateriaComponent],
  templateUrl: './pgs-list-disciplina.component.html',
  styleUrl: './pgs-list-disciplina.component.scss',
})
export class PgsListDisciplinaComponent {

  disciplinas = DISCIPLINAS_MOCK;

  
}
