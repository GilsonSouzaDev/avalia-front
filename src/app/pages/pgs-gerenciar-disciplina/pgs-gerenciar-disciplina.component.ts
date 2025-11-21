import { Component, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { CptGerenciarDisciplinaComponent } from '../../components/cpt-gerenciar-disciplina/cpt-gerenciar-disciplina.component';
import { DisciplinaService } from '../../services/disciplina.service';
import { Disciplina } from '../../interfaces/Disciplina';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-pgs-gerenciar-disciplina',
  standalone: true,
  imports: [CptGerenciarDisciplinaComponent],
  templateUrl: './pgs-gerenciar-disciplina.component.html',
  styleUrl: './pgs-gerenciar-disciplina.component.scss',
})
export class PgsGerenciarDisciplinaComponent {
  private disciplinaService = inject(DisciplinaService);
  private dialogService = inject(DialogService);

  disciplinas = this.disciplinaService.disciplinas;

  editandoId = signal<number | null>(null);
  nomeEditando = signal('');
  nomeCriando = signal('');
  criando = signal(false);

  qtdQuestoes = (d: Disciplina) => (d.perguntas ? d.perguntas.length : 0);
  qtdMaterias = (d: Disciplina) => (d.professores ? d.professores.length : 0);

  // --- CRIAÇÃO (VERDE) ---
  iniciarCriacao() {
    this.criando.set(true);
    this.nomeCriando.set('');
  }

  cancelarCriacao() {
    this.criando.set(false);
    this.nomeCriando.set('');
  }

  confirmarCriacao(nome: string) {
    this.dialogService
      .confirmAction({
        title: 'Confirmar Criação',
        message: `Deseja adicionar a nova disciplina "${nome}"?`,
        confirmButtonText: 'Adicionar',
        cancelButtonText: 'Cancelar',
        titleColor: '#2e7d32', // Verde
        action: () => {
          return of(true).pipe(
            delay(1000),
            tap(() => {
              const novo: Disciplina = {
                id: Date.now(),
                nome,
                professores: [],
                perguntas: [],
              };
              this.disciplinaService.add(novo);
            })
          );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.cancelarCriacao();
        }
      });
  }

  // --- EDIÇÃO (AZUL) ---
  iniciarEdicao(id: number) {
    const d = this.disciplinaService.getById(id);
    if (!d) return;
    this.editandoId.set(id);
    this.nomeEditando.set(d.nome);
  }

  cancelarEdicao() {
    this.editandoId.set(null);
    this.nomeEditando.set('');
  }

  confirmarEdicao({ id, nome }: { id: number; nome: string }) {
    this.dialogService
      .confirmAction({
        title: 'Salvar Alterações',
        message: 'Deseja confirmar a alteração no nome da disciplina?',
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        titleColor: '#1565c0', // Azul
        action: () => {
          return of(true).pipe(
            delay(1000),
            tap(() => {
              this.disciplinaService.update(id, { nome });
            })
          );
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.cancelarEdicao();
        }
      });
  }

  // --- EXCLUSÃO (VERMELHO) ---
  remover(id: number) {
    const disciplina = this.disciplinaService.getById(id);
    const nome = disciplina ? disciplina.nome : 'esta disciplina';

    this.dialogService.confirmAction({
      title: 'Excluir Disciplina',
      message: `Tem certeza que deseja excluir "${nome}"? Esta ação removerá vínculos com professores e excluirá questões de "${nome}" permanentemente.`,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      titleColor: '#c62828', // Vermelho
      action: () => {
        return of(true).pipe(
          delay(1000),
          tap(() => {
            this.disciplinaService.delete(id);
          })
        );
      },
    });
  }
}
