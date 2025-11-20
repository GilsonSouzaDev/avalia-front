import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { CptPerguntaFormsComponent } from '../../components/cpt-pergunta-forms/cpt-pergunta-forms.component';
import { Disciplina } from '../../interfaces/Disciplina';
import { MOCK_DISCIPLINAS } from '../../data/mock-data';
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { Pergunta } from '../../interfaces/Pergunta';
import { PerguntaService } from '../../services/pergunta.service';
import { AlertDialogComponent } from '../../shared/components/alert-dialog/alert-dialog.component';

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

  private preguntaService = inject(PerguntaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router); // <--- Injetado
  private authService = inject(AuthService);
  private dialog = inject(MatDialog); // <--- Injetado

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.perguntaParaEdicao = this.preguntaService.getById(id);
    }
  }

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }

  // Método chamado quando o filho emite o evento (submitForm)
  handleSave(pergunta: Pergunta): void {
    // Lógica simples para diferenciar Edição de Criação
    if (this.perguntaParaEdicao) {
      // MODO EDIÇÃO
      // this.preguntaService.update(pergunta); // Supondo que exista esse método no service
      this.openSuccessDialog(
        'Questão Atualizada',
        'A questão foi alterada com sucesso!'
      );
    } else {
      // MODO CRIAÇÃO
      // this.preguntaService.create(pergunta); // Supondo que exista esse método no service
      this.openSuccessDialog(
        'Questão Cadastrada',
        'A nova questão foi salva com sucesso!'
      );
    }
  }

  private openSuccessDialog(titulo: string, mensagem: string): void {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: titulo,
        message: mensagem + ' Redirecionando...',
        confirmButtonText: 'OK',
        titleColor: 'green', // <--- Cor VERDE para sucesso
      },
    });

    // Fecha automaticamente após 3 segundos
    setTimeout(() => {
      dialogRef.close();
    }, 3000);

    // Redireciona ao fechar
    dialogRef.afterClosed().subscribe(() => {
      // Ajuste a rota para onde deseja ir (ex: lista de questões ou dashboard)
      this.router.navigate(['/dashboard']);
    });
  }
}
