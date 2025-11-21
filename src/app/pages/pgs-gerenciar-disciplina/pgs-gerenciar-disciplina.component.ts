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
    this.disciplinaService.getById(id).subscribe((d) => {
      if (d) {
        this.nomeEditando.set(d.nome);
        // Mova a lógica que usa 'd' para dentro destas chaves
        const nome = d.nome; // Agora funciona
      }
    });
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
    // 1. Primeiro nos inscrevemos para buscar o dado real
    this.disciplinaService.getById(id).subscribe((disciplina) => {
      // 2. Agora 'disciplina' é o objeto real, podemos acessar .nome
      const nome = disciplina ? disciplina.nome : 'esta disciplina';

      // 3. Movemos a lógica do Dialog para dentro do subscribe
      this.dialogService
        .confirmAction({
          title: 'Excluir Disciplina',
          message: `Tem certeza que deseja excluir "${nome}"? essa ação vai EXCLUIR todas as perguntas cadastradas nesta disciplina.` ,
          confirmButtonText: 'Excluir',
          cancelButtonText: 'Cancelar',
          titleColor: '#d32f2f',
          action: () => {
            // Retorna o Observable do delete
            return this.disciplinaService.delete(id);
          },
        })
        .afterClosed()
        .subscribe((sucesso) => {
          if (sucesso) {
            // Opcional: Atualizar lista ou mostrar toast
            console.log('Disciplina excluída');
          }
        });
    });
  }
}
