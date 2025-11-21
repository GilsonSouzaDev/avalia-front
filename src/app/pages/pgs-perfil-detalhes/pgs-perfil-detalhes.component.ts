import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators'; // Removido 'of' e 'delay' pois usaremos a API real
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
      // CORREÇÃO 1: Usando subscribe para consumir o Observable
      this.professorService.getById(id).subscribe({
        next: (prof) => {
          this.professor.set(prof);
          this.mostrarDisciplinas =
            currentUser?.tipo === TipoProfessor.COORDENADOR;
        },
        error: (err) => {
          console.error('Erro ao buscar professor:', err);
          // Opcional: Redirecionar ou mostrar mensagem se não encontrar
        },
      });
      return;
    }

    // Caso não tenha ID na rota, usa o usuário logado
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
    // Mantendo sua lógica de limpeza, útil para evitar recursão no JSON
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
          // CORREÇÃO 2: Retornar o Observable da requisição HTTP real
          // O DialogService provavelmente faz o subscribe internamente
          return this.professorService
            .update(professorSanitizado.id, professorSanitizado)
            .pipe(
              tap((profAtualizadoRetornado) => {
                // Atualiza o estado local com o retorno da API
                this.professor.set(profAtualizadoRetornado);

                const currentUser = this.authService.currentUserSig();
                // Se estiver editando o próprio perfil, atualiza o Auth também
                if (currentUser?.id === profAtualizadoRetornado.id) {
                  this.authService.currentUserSig.set(profAtualizadoRetornado);
                }
              })
            );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.editando = false;
          // Opcional: Navegar ou apenas ficar na tela com dados atualizados
          // this.router.navigate(['/dashboard']);
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
          // CORREÇÃO 3: Retornar o Observable do Delete real
          return this.professorService.delete(prof.id);
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.router.navigate(['/dashboard']); // Ou para lista de professores
        }
      });
  }

  alternarEdicao(): void {
    this.editando = !this.editando;
  }
}
