import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of } from 'rxjs'; // <--- Importante adicionar isso


import { ProfessorService } from '../../services/professor.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Professor } from '../../interfaces/Professor';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { AuthService } from '../../core/auth.service';
import { CptPerfilDatalhesComponent } from "../../components/cpt-perfil-datalhes/cpt-perfil-datalhes.component";

@Component({
  selector: 'app-pgs-perfil-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    CptProfessorFormsComponent,
    CptPerfilDatalhesComponent,
  ],
  templateUrl: './pgs-perfil-detalhes.component.html',
  styleUrl: './pgs-perfil-detalhes.component.scss',
})
export class PgsPerfilDetalhesComponent {
  private authService = inject(AuthService);
  private professorService = inject(ProfessorService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  professor = this.authService.currentUserSig;
  editando = signal(false);

  get mostrarDisciplinas(): boolean {
    return this.authService.isCoordenador();
  }

  get podeExcluir(): boolean {
    return this.authService.isCoordenador();
  }

  alternarEdicao() {
    this.editando.update((v) => !v);
  }

  atualizarPerfil(dadosAtualizados: Professor) {
    if (!dadosAtualizados.id) return;
    console.log(dadosAtualizados);
    this.professorService
      .update(dadosAtualizados.id, dadosAtualizados)
      .subscribe({
        next: (profAtualizado) => {
          this.authService.currentUserSig.set(profAtualizado);
          this.editando.set(false);

          this.dialogService
            .confirmAction({
              title: 'Perfil Atualizado',
              message: 'Seus dados foram alterados com sucesso.',
              confirmButtonText: 'OK',
              cancelButtonText: '',
              titleColor: 'green',
              action: () => of(true), // <--- CORREÇÃO AQUI: Retorna um Observable imediato
            })
            .afterClosed()
            .subscribe();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  excluirPerfil() {
    const prof = this.professor();
    if (!prof || !prof.id) return;

    this.dialogService
      .confirmAction({
        title: 'Excluir Conta',
        message:
          'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
        confirmButtonText: 'Excluir Definitivamente',
        cancelButtonText: 'Cancelar',
        titleColor: '#d32f2f',
        action: () => {
          return this.professorService.delete(prof.id!);
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.authService.logout();
        }
      });
  }
}
