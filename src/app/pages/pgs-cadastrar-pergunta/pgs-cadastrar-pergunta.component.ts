import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { CptPerguntaFormsComponent } from '../../components/cpt-pergunta-forms/cpt-pergunta-forms.component';
import { DisciplinaService } from '../../services/disciplina.service';
import { PerguntaService } from '../../services/pergunta.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { Pergunta, CadastrarPergunta } from '../../interfaces/Pergunta';
import { AlertDialogComponent } from '../../shared/components/alert-dialog/alert-dialog.component';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-pgs-cadastrar-pergunta',
  standalone: true,
  imports: [CptPerguntaFormsComponent, CommonModule, RouterModule],
  templateUrl: './pgs-cadastrar-pergunta.component.html',
  styleUrl: './pgs-cadastrar-pergunta.component.scss',
})
export class PgsCadastrarPerguntaComponent implements OnInit {
  perguntaParaEdicao: Pergunta | null = null;

  private perguntaService = inject(PerguntaService);
  private disciplinaService = inject(DisciplinaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  disciplinas = this.disciplinaService.disciplinas;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.perguntaService.getById(id).subscribe({
        next: (pergunta) => {
          this.perguntaParaEdicao = pergunta;
        },
        error: () => {
          this.router.navigate(['/dashboard']);
        },
      });
    }
  }

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas(), this.usuario);
  }

  handleSave(formValue: any): void {
    if (!this.usuario) return;

    if (this.perguntaParaEdicao) {
      const id = this.perguntaParaEdicao.id;
      this.perguntaService.update(id, formValue).subscribe(() => {
        this.openSuccessDialog(
          'Questão Atualizada',
          'A questão foi alterada com sucesso!'
        );
      });
    } else {
      const novaPergunta: CadastrarPergunta = {
        ...formValue,
        codigoProfessor: this.usuario.codigo,
      };

      this.perguntaService.add(novaPergunta).subscribe(() => {
        this.openSuccessDialog(
          'Questão Cadastrada',
          'A nova questão foi salva com sucesso!'
        );
      });
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
        titleColor: 'green',
      },
    });

    const timer = setTimeout(() => {
      dialogRef.close();
    }, 3000);

    dialogRef.afterClosed().subscribe(() => {
      clearTimeout(timer);
      this.router.navigate(['/dashboard']);
    });
  }
}
