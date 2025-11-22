import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes Filhos
import { CptProfessorTableComponent } from '../../components/cpt-professor-table/cpt-professor-table.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';

// Interfaces e Utils
import { Professor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import {
  contarPerguntasPorDisciplinaEProfessorEspecifico,
  filtrarDisciplinasPorPerfil,
} from '../../utils/disicplina-filter-util';

// Services (Onde a mágica acontece)
import { ProfessorService } from '../../services/professor.service';
import { DisciplinaService } from '../../services/disciplina.service';
import { PerguntaService } from '../../services/pergunta.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-pgs-gerenciar-professor',
  standalone: true,
  imports: [
    CptProfessorTableComponent,
    CptProfessorFormsComponent,
    CommonModule,
  ],
  templateUrl: './pgs-gerenciar-professor.component.html',
})
export class PgsGerenciarProfessorComponent {
  // Injeção de Serviços
  private authService = inject(AuthService);
  private professorService = inject(ProfessorService);
  private disciplinaService = inject(DisciplinaService);
  private perguntaService = inject(PerguntaService);

  // Estado Local
  modoCadastro = signal(false);
  professorParaEdicao = signal<Professor | null>(null); // Para passar ao form se for editar

  // Signals dos Serviços (Substituem os Mocks)
  professores = this.professorService.professores;
  disciplinas = this.disciplinaService.disciplinas;
  perguntas = this.perguntaService.perguntas; // Necessário para contagem

  // --- Ações de Tela ---

  abrirCadastro() {
    this.professorParaEdicao.set(null); // Limpa para novo cadastro
    this.modoCadastro.set(true);
  }

  fecharCadastro() {
    this.modoCadastro.set(false);
    this.professorParaEdicao.set(null);
  }

  /**
   * Método chamado quando o formulário emite o evento de salvar
   */
  handleSalvarProfessor(professor: Professor) {
    if (professor.id) {
      // Edição
      this.professorService.update(professor.id, professor).subscribe(() => {
        this.fecharCadastro();
      });
    } else {
      // Criação
      this.professorService.add(professor).subscribe(() => {
        this.fecharCadastro();
      });
    }
  }

  /**
   * Método chamado pela tabela para deletar
   */
  handleDeletarProfessor(id: number) {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
      this.professorService.delete(id).subscribe();
    }
  }

  /**
   * Método chamado pela tabela para editar
   */
  handleEditarProfessor(professor: Professor) {
    this.professorParaEdicao.set(professor);
    this.modoCadastro.set(true);
  }

  // ---- Indicadores (Usados na Tabela) ----

  /**
   * Conta quantas perguntas no total o professor criou.
   * Filtra a lista global de perguntas pelo código do professor.
   */
  quantidadeQuestoes = (professor: Professor) => {
    const todasPerguntas = this.perguntas(); // Pega valor atual do signal
    return todasPerguntas.filter((p) => p.codigoProfessor === professor.codigo)
      .length;
  };

  /**
   * Conta quantas matérias o professor leciona.
   */
  quantidadeMaterias = (professor: Professor) => {
    return professor.disciplinas?.length ?? 0;
  };

  // ---- Getters e Utilitários ----

  get usuario(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  /**
   * Retorna disciplinas filtradas para o usuário logado (caso queira exibir em algum card)
   */
  get disciplinasFiltradas() {
    // Nota: filtrarDisciplinasPorPerfil foi ajustado na resposta anterior
    // para usar apenas a lista interna do professor se disponível
    return filtrarDisciplinasPorPerfil(this.disciplinas(), this.usuario);
  }

  /**
   * Conta perguntas de um professor específico em uma disciplina específica.
   * Atualizado para passar a lista de perguntas global para a função utilitária.
   */
  contarPerguntasNaDisciplina(
    disciplina: Disciplina,
    usuario: Professor | null | undefined
  ): number {
    if (!usuario) return 0;

    return contarPerguntasPorDisciplinaEProfessorEspecifico(
      disciplina.id,
      usuario,
      this.perguntas() // Passamos a lista global de perguntas carregada do backend
    );
  }

  // ---- Total geral de perguntas no sistema ----
  contarPerguntasGerais(): number {
    return this.perguntas().length;
  }
}
