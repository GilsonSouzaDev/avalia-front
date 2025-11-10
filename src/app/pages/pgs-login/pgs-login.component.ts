import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { CptBannerComponent } from '../../components/cpt-banner/cpt-banner.component';
import { CptLoginformsComponent } from '../../components/cpt-loginforms/cpt-loginforms.component';
import { AuthService } from '../../core/auth.service';
import { AlertDialogComponent } from '../../shared/components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-pgs-login',

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
      this.router.navigate(['/dashboard']);
    } else {
      this.openErrorDialog();
    }
  }


  private openErrorDialog(): void {
    this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: {
        title: 'Falha na Autenticação',
        message:
          'O e-mail ou a senha que você inseriu estão incorretos. Por favor, verifique seus dados e tente novamente.',
        confirmButtonText: 'Tentar Novamente',
      },
    });
  }
}
