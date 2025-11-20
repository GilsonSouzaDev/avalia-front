import { Component, inject, OnInit } from '@angular/core';
import { CptPerguntaFormsComponent } from '../../components/cpt-pergunta-forms/cpt-pergunta-forms.component';
import { Disciplina } from '../../interfaces/Disciplina';
import { MOCK_DISCIPLINAS } from '../../data/mock-data';
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { Pergunta } from '../../interfaces/Pergunta';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PerguntaService } from '../../services/pergunta.service';

@Component({
  selector: 'app-pgs-cadastrar-pergunta',
  standalone: true,
  imports: [CptPerguntaFormsComponent, CommonModule, RouterModule],
  templateUrl: './pgs-cadastrar-pergunta.component.html',
  styleUrl: './pgs-cadastrar-pergunta.component.scss',
})
export class PgsCadastrarPerguntaComponent implements OnInit {

  disciplinas = MOCK_DISCIPLINAS;

  perguntaParaEdicao: Pergunta | null = null;

  perguntaService = inject(PerguntaService);
  route = inject(ActivatedRoute);

  private authService = inject(AuthService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.perguntaParaEdicao = this.perguntaService.getById(id);

      console.log('Pergunta carregada:', this.perguntaParaEdicao);
    }
  }

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }
}
