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
  
  // CORREÇÃO 1: Inicialize explicitamente com null
  professorLogadoId: number | null = null;

  private perguntaService = inject(PerguntaService);
  private disciplinaService = inject(DisciplinaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  disciplinas = this.disciplinaService.disciplinas;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const usuarioAtual = this.usuario;

    // CORREÇÃO 2: Garante que undefined vire null imediatamente
    // Se usuarioAtual?.id for undefined, usamos null.
    this.professorLogadoId = usuarioAtual?.id ?? null;

    if (idParam) {
      const id = Number(idParam);
      this.perguntaService.getById(id).subscribe({
        next: (pergunta) => {
          this.perguntaParaEdicao = pergunta;
          // Se a pergunta tem professorId, usa ele. Se não, mantém o do usuário logado.
          this.professorLogadoId = pergunta.professorId ?? this.professorLogadoId;
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
    console.log('Form Value:', formValue);
    if (!this.usuario) return;

    if (this.perguntaParaEdicao) {
      // --- MODO EDIÇÃO ---
      const id = this.perguntaParaEdicao.id;

      const payloadAtualizacao = {
        ...formValue,
        id: id,
        professorId: this.perguntaParaEdicao.professorId || this.usuario.id,
      };

      this.perguntaService.update(id, payloadAtualizacao).subscribe({
        next: () => {
          this.openSuccessDialog(
            'Questão Atualizada',
            'A questão foi alterada com sucesso!'
          );
        },
        error: (err) => console.error('Erro ao atualizar', err),
      });
    } else {
      // --- MODO CADASTRO ---
      const novaPergunta: CadastrarPergunta = {
        ...formValue,
        professorId: this.usuario.id,
      };

      this.perguntaService.add(novaPergunta).subscribe({
        next: () => {
          this.openSuccessDialog(
            'Questão Cadastrada',
            'A nova questão foi salva com sucesso!'
          );
        },
        error: (err) => console.error('Erro ao criar', err),
      });
    }
  }

  private openSuccessDialog(titulo: string, mensagem: string): void {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: titulo,
        message: mensagem,
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