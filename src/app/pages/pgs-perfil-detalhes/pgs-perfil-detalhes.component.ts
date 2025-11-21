import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { CptPerfilDatalhesComponent } from '../../components/cpt-perfil-datalhes/cpt-perfil-datalhes.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service';
import { ProfessorService } from '../../services/professor.service';
import { DialogService } from '../../shared/services/dialog.service';

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
  private router = inject(Router);
  private professorService = inject(ProfessorService);
  private dialogService = inject(DialogService);

  public professor: WritableSignal<Professor | null> = signal(null);
  public editando = false;
  public mostrarDisciplinas = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const currentUser = this.authService.currentUserSig();

    if (id) {
      const prof = this.professorService.getById(id);
      if (prof) {
        this.professor.set(prof);
        this.mostrarDisciplinas =
          currentUser?.tipo === TipoProfessor.COORDENADOR;
      }
      return;
    }

    if (currentUser) {
      this.professor.set(currentUser);
      this.mostrarDisciplinas = currentUser.tipo === TipoProfessor.COORDENADOR;
    }
  }

  get podeExcluir(): boolean {
    const currentUser = this.authService.currentUserSig();
    const perfilAtual = this.professor();

    if (!currentUser || !perfilAtual) return false;

    const isCoordenador = currentUser.tipo === TipoProfessor.COORDENADOR;
    const isOutroUsuario = currentUser.id !== perfilAtual.id;

    return isCoordenador && isOutroUsuario;
  }

  private sanitizeProfessor(professor: Professor): Professor {
    const copia = { ...professor };
    if (copia.disciplinas) {
      copia.disciplinas = copia.disciplinas.map((d) => {
        const { professores, ...disciplinaLimpa } = d as any;
        return disciplinaLimpa;
      });
    }
    return copia;
  }

  atualizarPerfil(professorAtualizado: Professor): void {
    const professorSanitizado = this.sanitizeProfessor(professorAtualizado);

    this.dialogService
      .confirmAction({
        title: 'Confirmar Atualização',
        message: 'Deseja salvar as alterações realizadas no perfil?',
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        titleColor: '#1565c0', // Azul
        action: () => {
          return of(true).pipe(
            delay(1000),
            tap(() => {
              this.professorService.update(
                professorSanitizado.id,
                professorSanitizado
              );
              this.professor.set(professorSanitizado);

              const currentUser = this.authService.currentUserSig();
              if (currentUser?.id === professorSanitizado.id) {
                this.authService.currentUserSig.set(professorSanitizado);
              }
            })
          );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.editando = false;
          this.router.navigate(['/dashboard']);
        }
      });
  }

  excluirPerfil(): void {
    const prof = this.professor();
    if (!prof) return;

    this.dialogService
      .confirmAction({
        title: 'Excluir Perfil',
        message: `Tem certeza que deseja excluir o perfil de ${prof.nome}? Esta ação é irreversível.`,
        confirmButtonText: 'Sim, Excluir',
        cancelButtonText: 'Cancelar',
        titleColor: '#c62828',
        action: () => {
          return of(true).pipe(
            delay(1000),
            tap(() => {
              this.professorService.delete(prof.id);
            })
          );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  alternarEdicao(): void {
    this.editando = !this.editando;
  }
}
