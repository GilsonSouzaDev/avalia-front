// src/app/pages/pgs-perfil-detalhes/pgs-perfil-detalhes.component.ts

import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CptPerfilDatalhesComponent } from '../../components/cpt-perfil-datalhes/cpt-perfil-datalhes.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service'; // 1. Importar o AuthService

@Component({
  selector: 'app-pgs-perfil-detalhes',
  standalone: true,
  imports: [CptPerfilDatalhesComponent, CptProfessorFormsComponent],
  templateUrl: './pgs-perfil-detalhes.component.html',
  styleUrls: ['./pgs-perfil-detalhes.component.scss'],
})
export class PgsPerfilDetalhesComponent implements OnInit {
  private authService = inject(AuthService);

  public professor: WritableSignal<Professor | null> = signal(null);

  public editando = false;

  public mostrarDisciplinas: boolean = false;

  ngOnInit(): void {
    const currentUser = this.authService.currentUserSig();

    if (currentUser) {
      this.professor.set(currentUser);

      if (currentUser.tipo === TipoProfessor.COORDENADOR) {
        this.mostrarDisciplinas = true;
      } else {
        this.mostrarDisciplinas = false;
      }
    } else {
      console.error('Nenhum usuário logado encontrado na página de perfil.');
    }
  }

  atualizarPerfil(professorAtualizado: Professor): void {
    this.professor.set(professorAtualizado);
    this.authService.currentUserSig.set(professorAtualizado);
    this.editando = false;
    console.log(
      'Perfil atualizado no estado local e global:',
      this.professor()
    );
  }

  alternarEdicao(): void {
    this.editando = !this.editando;
  }

  excluirPerfil(): void {
    console.log('Perfil a ser excluído:', this.professor()?.nome);
  }
}
