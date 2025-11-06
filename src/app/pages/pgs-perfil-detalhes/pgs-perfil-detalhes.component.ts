import { Component } from '@angular/core';
import { CptPerfilDatalhesComponent } from '../../components/cpt-perfil-datalhes/cpt-perfil-datalhes.component';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import { CptProfessorFormsComponent } from "../../components/cpt-professor-forms/cpt-professor-forms.component";


@Component({
  selector: 'app-pgs-perfil-detalhes',
  standalone: true,
  imports: [CptPerfilDatalhesComponent, CptProfessorFormsComponent],
  templateUrl: './pgs-perfil-detalhes.component.html',
  styleUrls: ['./pgs-perfil-detalhes.component.scss'],
})
export class PgsPerfilDetalhesComponent {
  professor: Professor = {
    id: 1,
    nome: 'Prof. Carlos Mendes',
    email: 'carlos.mendes@escola.com',
    senha: '',
    tipo: TipoProfessor.PROFESSOR,
    disciplinas: [
      {
        id: 1,
        nome: 'Banco de Dados',
        professores: [],
        perguntas: [],
      } as Disciplina,
    ],
  };

  atualizarPerfil(professorAtualizado: Professor) {
    this.professor = { ...professorAtualizado };
    this.editando = false;
    console.log('Perfil atualizado:', this.professor);
  }

  editando = false;


  alternarEdicao() {
    this.editando = !this.editando;
  }

  excluirPerfil() {
    console.log('Perfil excluído!');
  }
}
