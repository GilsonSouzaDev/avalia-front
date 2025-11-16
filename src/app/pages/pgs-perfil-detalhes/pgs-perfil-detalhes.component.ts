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
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../services/professor.service';

@Component({
  selector: 'app-pgs-perfil-detalhes',
  standalone: true,
  imports: [CptPerfilDatalhesComponent, CptProfessorFormsComponent],
  templateUrl: './pgs-perfil-detalhes.component.html',
  styleUrls: ['./pgs-perfil-detalhes.component.scss'],
})
export class PgsPerfilDetalhesComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private professorService = inject(ProfessorService);

  public professor: WritableSignal<Professor | null> = signal(null);

  public editando = false;
  public mostrarDisciplinas = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const currentUser = this.authService.currentUserSig();

    // ================================================================
    // 1) PERFIL VINDO DO BOTÃO DA TABELA (tem ID)
    // ================================================================
    if (id) {
      const prof = this.professorService.getById(id);
      if (prof) {
        this.professor.set(prof);

        // ✔️ AGORA verifica o tipo de quem está logado
        this.mostrarDisciplinas =
          currentUser?.tipo === TipoProfessor.COORDENADOR;
      }
      return;
    }

    // ================================================================
    // 2) PERFIL DO LOGIN (não veio ID)
    // ================================================================
    if (currentUser) {
      this.professor.set(currentUser);

      // ✔️ Mesma regra: coordenador sempre vê disciplinas
      this.mostrarDisciplinas = currentUser.tipo === TipoProfessor.COORDENADOR;
    }
  }

  atualizarPerfil(professorAtualizado: Professor): void {
    this.professor.set(professorAtualizado);

    // atualiza no AuthService também
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
