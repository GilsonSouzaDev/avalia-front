import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Adicionado ActivatedRoute
import { of } from 'rxjs';

import { ProfessorService } from '../../services/professor.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Professor } from '../../interfaces/Professor';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { AuthService } from '../../core/auth.service';
import { CptPerfilDatalhesComponent } from '../../components/cpt-perfil-datalhes/cpt-perfil-datalhes.component';
import { PerguntaService } from '../../services/pergunta.service';

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
export class PgsPerfilDetalhesComponent implements OnInit {
  private authService = inject(AuthService);
  private professorService = inject(ProfessorService);
  private perguntaService = inject(PerguntaService)
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Mudamos de uma referência direta para um signal local que podemos alterar
  professor = signal<Professor | null>(null);

  editando = signal(false);

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.professorService.getById(id).subscribe({
        next: (prof) => this.professor.set(prof),
        error: () => {
          this.router.navigate(['/gerenciar']);
        },
      });
    } else {
      // MODO: Visualizando meu próprio perfil
      // O operador ?? null garante que se for undefined, vira null
      this.professor.set(this.authService.currentUserSig() ?? null);
    }
  }

  get mostrarDisciplinas(): boolean {
    // Só mostra disciplinas se quem está vendo for Coordenador
    // (Pode ajustar essa lógica se o próprio professor puder ver as suas)
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

    this.professorService
      .update(dadosAtualizados.id, dadosAtualizados)
      .subscribe({
        next: (profAtualizado) => {
          this.professor.set(profAtualizado);

          // Atualiza o Auth Global
          const usuarioLogado = this.authService.currentUserSig();
          if (usuarioLogado && usuarioLogado.id === profAtualizado.id) {
            this.authService.currentUserSig.set(profAtualizado);
          }

          this.editando.set(false);

          this.perguntaService.loadAll();

          this.dialogService
            .confirmAction({
              title: 'Perfil Atualizado',
              message: 'Os dados foram alterados com sucesso.',
              confirmButtonText: 'OK',
              cancelButtonText: '',
              titleColor: 'green',
              action: () => of(true),
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

    // Verifica se estou me excluindo
    const usuarioLogado = this.authService.currentUserSig();
    const isExcluindoASiMesmo = usuarioLogado?.id === prof.id;

    this.dialogService
      .confirmAction({
        title: 'Excluir Conta',
        message: isExcluindoASiMesmo
          ? 'Tem certeza que deseja excluir SUA conta? Você será deslogado.'
          : `Esta ação irá EXCLUIR todas as PERGUNTAS criadas por este professor.Tem certeza que deseja excluir o professor ${prof.nome}?`,
        confirmButtonText: 'Excluir Definitivamente',
        cancelButtonText: 'Cancelar',
        titleColor: '#d32f2f', // Vermelho Warn
        action: () => {
          return this.professorService.delete(prof.id!);
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          if (isExcluindoASiMesmo) {
            // Se me excluí, logout
            this.authService.logout();
          } else {
            // Se excluí outro, volta para a lista de gerenciamento
            this.router.navigate(['/gerenciar']);
          }
        }
      });
  }
}
