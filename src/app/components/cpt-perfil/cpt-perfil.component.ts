import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';
import { Professor } from '../../interfaces/Professor';

@Component({
  selector: 'app-cpt-perfil',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cpt-perfil.component.html',
  styleUrl: './cpt-perfil.component.scss',
})
export class CptPerfilComponent {

  public authService = inject(AuthService);

  get currentUser(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }
}
