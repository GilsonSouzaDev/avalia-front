import { Component, Output, EventEmitter, inject } from '@angular/core';
import {
  RouterLink,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DialogService } from '../../shared/services/dialog.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pgs-navegacao',
  standalone: true,
  imports: [RouterModule, RouterLink],
  templateUrl: './pgs-navegacao.component.html',
  styleUrl: './pgs-navegacao.component.scss',
})
export class PgsNavegacaoComponent {
  @Output() fecharMenu = new EventEmitter<void>();

  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  constructor() {
    // Fecha o menu automaticamente ao navegar para qualquer rota
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.fecharMenu.emit();
      });
  }

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
