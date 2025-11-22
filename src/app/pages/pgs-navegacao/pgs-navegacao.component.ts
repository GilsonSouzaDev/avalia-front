import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-pgs-navegacao',
  imports: [RouterModule, RouterLink],
  templateUrl: './pgs-navegacao.component.html',
  styleUrl: './pgs-navegacao.component.scss',
})
export class PgsNavegacaoComponent {
  private authService = inject(AuthService);

  private dialogService = inject(DialogService);

    deslogar() {
    this.dialogService.confirmAction({
      title: 'Sair do Sistema',
      message: 'Você tem certeza que deseja encerrar sua sessão?',
      confirmButtonText: 'Sair',
      cancelButtonText: 'Cancelar',
      titleColor: '#d32f2f',
      action: async () => {
        this.authService.logout();
        return true;
      },
    });
  }

  get isCoordenador() {
    return this.authService.isCoordenador();
  }

  get isProfessor() {
    return this.authService.isProfessor();
  }

  get currentUser() {
    return this.authService.currentUserSig();
  }
}
