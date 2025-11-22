import { Component, inject, signal } from '@angular/core';
import { CptGerenciarDisciplinaComponent } from '../../components/cpt-gerenciar-disciplina/cpt-gerenciar-disciplina.component';
import { DisciplinaService } from '../../services/disciplina.service';
import { ProfessorService } from '../../services/professor.service';
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
  private professorService = inject(ProfessorService);
  private dialogService = inject(DialogService);

  disciplinas = this.disciplinaService.disciplinas;
  professores = this.professorService.professores;

  editandoId = signal<number | null>(null);
  nomeEditando = signal('');
  nomeCriando = signal('');
  criando = signal(false);

  // Conta a quantidade de IDs de perguntas vinculados à disciplina
  qtdQuestoes = (d: Disciplina) => d.perguntasIds?.length ?? 0;

  // CORREÇÃO: Mantive o nome 'qtdMaterias' para bater com seu HTML,
  // mas a lógica conta PROFESSORES, pois é isso que faz sentido numa tabela de disciplinas.
  qtdMaterias = (d: Disciplina) => {
    const listaProfessores = this.professores();
    // Filtra quantos professores têm essa disciplina na lista deles
    return listaProfessores.filter((p) =>
      p.disciplinas?.some((disc) => disc.id === d.id)
    ).length;
  };

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
        titleColor: '#2e7d32',
        action: () => {
          const novaDisciplina: any = { nome };
          return this.disciplinaService.add(novaDisciplina);
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.cancelarCriacao();
        }
      });
  }

  iniciarEdicao(id: number) {
    this.editandoId.set(id);
    const disciplina = this.disciplinas().find((d) => d.id === id);
    if (disciplina) {
      this.nomeEditando.set(disciplina.nome);
    }
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
        titleColor: '#1565c0',
        action: () => {
          return this.disciplinaService.update(id, { nome });
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          this.cancelarEdicao();
        }
      });
  }

  remover(id: number) {
    const disciplina = this.disciplinas().find((d) => d.id === id);
    const nome = disciplina ? disciplina.nome : 'esta disciplina';

    this.dialogService
      .confirmAction({
        title: 'Excluir Disciplina',
        message: `Tem certeza que deseja excluir "${nome}"? Essa ação vai EXCLUIR todas as perguntas cadastradas nesta disciplina.`,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        titleColor: '#d32f2f',
        action: () => {
          return this.disciplinaService.delete(id);
        },
      })
      .afterClosed()
      .subscribe();
  }
}
