import { Component, inject } from '@angular/core';
import { CptLoginformsComponent } from "../../components/cpt-loginforms/cpt-loginforms.component";
import { CptBannerComponent } from "../../components/cpt-banner/cpt-banner.component";
import { CptSenhaformsComponent } from "../../components/cpt-senhaforms/cpt-senhaforms.component";
import { CommonModule } from '@angular/common';
import { EsqueciSenha } from '../../interfaces/EsqueciSenha';
import { ProfessorService } from '../../services/professor.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pgs-nova-senha',
  imports: [CptBannerComponent, CommonModule, CptSenhaformsComponent],
  templateUrl: './pgs-nova-senha.component.html',
  styleUrl: './pgs-nova-senha.component.scss',
})
export class PgsNovaSenhaComponent {
  private professorService = inject(ProfessorService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  // --- REDEFINIR SENHA ---
  handleLogin(data: EsqueciSenha) {
    this.dialogService.confirmAction({
      title: 'Redefinir Senha',
      message: 'Confirma a alteração da senha para este e-mail?',
      confirmButtonText: 'Sim, alterar',
      cancelButtonText: 'Cancelar',
      titleColor: '#1976d2',
      action: async () => {
        this.executarRedefinicao(data);
        return true;
      },
    });
  }

  private executarRedefinicao(data: EsqueciSenha) {
    this.professorService.redefinirSenha(data).subscribe({
      next: () => {
        this.dialogService.confirmAction({
          title: 'Sucesso',
          message: 'Sua senha foi redefinida com sucesso! Faça login.',
          confirmButtonText: 'Ir para Login',
          cancelButtonText: '',
          titleColor: '#2e7d32',
          action: async () => {
            await this.router.navigate(['/login']); 
            return true;
          },
        });
      },
      error: (err) => {
        this.dialogService.confirmAction({
          title: 'Erro',
          message:
            'Não foi possível redefinir a senha. Verifique se o e-mail está correto.',
          confirmButtonText: 'Fechar',
          cancelButtonText: '',
          titleColor: '#d32f2f', // Vermelho
          action: async () => true,
        });
      },
    });
  }
}

