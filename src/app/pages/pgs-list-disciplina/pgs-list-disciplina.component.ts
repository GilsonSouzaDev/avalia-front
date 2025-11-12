import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Disciplina } from '../../interfaces/Disciplina';
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { MOCK_DISCIPLINAS, MOCK_PROFESSORES } from '../../data/mock-data';
import { CptTableMateriaComponent } from "../../components/cpt-table-materia/cpt-table-materia.component";

@Component({
  selector: 'app-pgs-list-disciplina',
  standalone: true,
  imports: [MatTabsModule, CptTableMateriaComponent],
  templateUrl: './pgs-list-disciplina.component.html',
  styleUrl: './pgs-list-disciplina.component.scss',
})
export class PgsListDisciplinaComponent{

  disciplinas = MOCK_DISCIPLINAS;
  professores = MOCK_PROFESSORES;

  private authService = inject(AuthService);

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }



}
