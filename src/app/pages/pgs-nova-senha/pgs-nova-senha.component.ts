import { Component } from '@angular/core';
import { CptLoginformsComponent } from "../../components/cpt-loginforms/cpt-loginforms.component";
import { CptBannerComponent } from "../../components/cpt-banner/cpt-banner.component";
import { CptSenhaformsComponent } from "../../components/cpt-senhaforms/cpt-senhaforms.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pgs-nova-senha',
  imports: [CptBannerComponent, CommonModule, CptSenhaformsComponent],
  templateUrl: './pgs-nova-senha.component.html',
  styleUrl: './pgs-nova-senha.component.scss',
})
export class PgsNovaSenhaComponent {


  handleLogin(data: { email: string; password: string }) {
    console.log('Recebido do filho:', data);
    // Chamar serviço de autenticação, etc.
  }
}
