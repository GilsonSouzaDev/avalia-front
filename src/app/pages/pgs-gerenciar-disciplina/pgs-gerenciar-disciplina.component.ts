import { Component, inject, signal } from '@angular/core';
import { CptGerenciarDisciplinaComponent } from '../../components/cpt-gerenciar-disciplina/cpt-gerenciar-disciplina.component';
import { DisciplinaService } from '../../services/disciplina.service';
import { Disciplina } from '../../interfaces/Disciplina';

@Component({
  selector: 'app-pgs-gerenciar-disciplina',
  standalone: true,
  imports: [CptGerenciarDisciplinaComponent],
  templateUrl: './pgs-gerenciar-disciplina.component.html',
  styleUrl: './pgs-gerenciar-disciplina.component.scss',
})
export class PgsGerenciarDisciplinaComponent {
  disciplinaService = inject(DisciplinaService);

  disciplinas = this.disciplinaService.disciplinas;

  editandoId = signal<number | null>(null);

  nomeEditando = signal('');
  nomeCriando = signal('');
  criando = signal(false);

  // Helpers usados no template da tabela
  qtdQuestoes = (d: Disciplina) => d.perguntas.length;
  qtdMaterias = (d: Disciplina) => d.professores.length;

  // --- CRIAÇÃO ---
  iniciarCriacao() {
    this.criando.set(true);
    this.nomeCriando.set('');
  }

  cancelarCriacao() {
    this.criando.set(false);
    this.nomeCriando.set('');
  }

  confirmarCriacao(nome: string) {
    const novo: Disciplina = {
      id: Date.now(),
      nome,
      professores: [],
      perguntas: [],
    };

    this.disciplinaService.add(novo);
    this.cancelarCriacao();
  }

  // --- EDIÇÃO ---
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
    this.disciplinaService.update(id, { nome });
    this.cancelarEdicao();
  }

  // --- DELETE ---
  remover(id: number) {
    this.disciplinaService.delete(id);
  }
}
