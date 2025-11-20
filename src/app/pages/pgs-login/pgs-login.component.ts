import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { CptBannerComponent } from '../../components/cpt-banner/cpt-banner.component';
import { CptLoginformsComponent } from '../../components/cpt-loginforms/cpt-loginforms.component';
import { AuthService } from '../../core/auth.service';
import { AlertDialogComponent } from '../../shared/components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-pgs-login',
  standalone: true,
  imports: [CptBannerComponent, CptLoginformsComponent],
  templateUrl: './pgs-login.component.html',
  styleUrl: './pgs-login.component.scss',
})
export class PgsLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  handleLogin(data: { email: string; password: string }) {
    const usuarioLogado = this.authService.login(data.email, data.password);

    if (usuarioLogado) {
      this.openSuccessDialog();
    } else {
      this.openErrorDialog();
    }
  }

  private openSuccessDialog(): void {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Login Realizado',
        message: 'Autenticação feita com sucesso! Redirecionando...',
        confirmButtonText: 'OK',
        titleColor: 'green', // <--- AQUI: Define a cor verde para o sucesso
      },
    });

    // Fecha automaticamente após 3 segundos
    setTimeout(() => {
      dialogRef.close();
    }, 3000);

    // Redireciona ao fechar (seja pelo timer ou clique do usuário)
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  private openErrorDialog(): void {
    this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: {
        title: 'Falha na Autenticação',
        message: 'O e-mail ou a senha que você inseriu estão incorretos.',
        confirmButtonText: 'Tentar Novamente',
        // Não passamos 'titleColor', então ele usa o vermelho padrão do HTML
      },
    });
  }
}
