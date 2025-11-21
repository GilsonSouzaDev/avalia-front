import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CptCardResumoComponent } from '../../components/cpt-card-resumo/cpt-card-resumo.component';
import { CptCardMateriaComponent } from '../../components/cpt-card-materia/cpt-card-materia.component';
import { AuthService } from '../../core/auth.service';
import { DisciplinaService } from '../../services/disciplina.service';
import { ProfessorService } from '../../services/professor.service';
import { PerguntaService } from '../../services/pergunta.service';
import { Disciplina } from '../../interfaces/Disciplina';
import { TipoProfessor } from '../../interfaces/Professor';

@Component({
  selector: 'app-pgs-dashboard',
  standalone: true,
  imports: [CommonModule, CptCardResumoComponent, CptCardMateriaComponent],
  templateUrl: './pgs-dashboard.component.html',
  styleUrls: ['./pgs-dashboard.component.scss'],
})
export class PgsDashboardComponent {
  private authService = inject(AuthService);
  private disciplinaService = inject(DisciplinaService);
  private professorService = inject(ProfessorService);
  private perguntaService = inject(PerguntaService);

  private listaDisciplinas = this.disciplinaService.disciplinas;
  private listaPerguntas = this.perguntaService.perguntas;
  private listaProfessores = this.professorService.professores;



  public usuario = this.authService.currentUserSig;

  public totalProfessores = computed(() => this.listaProfessores().length);
  public totalDisciplinas = computed(() => this.listaDisciplinas().length);
  public totalPerguntas = computed(() => this.listaPerguntas().length);

  public disciplinasLecionadas = computed(() => {
    const user = this.usuario();
    return user?.disciplinas?.length || 0;
  });

  public perguntasLecionadas = computed(() => {
    const user = this.usuario();
    if (!user) return 0;
    return this.listaPerguntas().filter(
      (p) => p.codigoProfessor === user.codigo
    ).length;
  });

  public disciplinasFiltradas = computed(() => {
    const todas = this.listaDisciplinas();
    const user = this.usuario();

    if (!user) return [];

    if (user.perfilProfessor === TipoProfessor.COORDENADOR) {
      return todas;
    }

    const meusIds = user.disciplinas?.map((d) => d.id) || [];
    return todas.filter((d) => meusIds.includes(d.id));
  });

  contarPerguntasNaDisciplina(disciplina: Disciplina): number {
    const user = this.usuario();
    const todasPerguntas = this.listaPerguntas();
    const perguntasDaDisciplina = todasPerguntas.filter(
      (p) => p.disciplinaId === disciplina.id
    );

    if (user && user.perfilProfessor === TipoProfessor.PROFESSOR) {
      return perguntasDaDisciplina.filter(
        (p) => p.codigoProfessor === user.codigo
      ).length;
    }

    return perguntasDaDisciplina.length;
  }
}
