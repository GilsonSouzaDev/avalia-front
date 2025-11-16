import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-pgs-navegacao',
  imports: [RouterModule, RouterLink],
  templateUrl: './pgs-navegacao.component.html',
  styleUrl: './pgs-navegacao.component.scss',
})
export class PgsNavegacaoComponent {
  private authService = inject(AuthService);

  deslogar() {
    this.authService.logout();
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
