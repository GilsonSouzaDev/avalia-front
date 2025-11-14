import { Component, signal } from '@angular/core';
import { CptProfessorTableComponent } from '../../components/cpt-professor-table/cpt-professor-table.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { Professor } from '../../interfaces/Professor';
import { MOCK_PROFESSORES } from '../../data/mock-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pgs-gerenciar-professor',
  standalone: true,
  imports: [CptProfessorTableComponent, CptProfessorFormsComponent, CommonModule],
  templateUrl: './pgs-gerenciar-professor.component.html',
})
export class PgsGerenciarProfessorComponent {

  modoCadastro = signal(false);
  professores = MOCK_PROFESSORES;

  abrirCadastro() {
    this.modoCadastro.set(true);
  }

  fecharCadastro() {
    this.modoCadastro.set(false);
  }
}


