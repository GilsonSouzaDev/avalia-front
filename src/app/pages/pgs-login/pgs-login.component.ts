import { Component } from '@angular/core';
import { CptBannerComponent } from "../../components/cpt-banner/cpt-banner.component";
import { CptLoginformsComponent } from "../../components/cpt-loginforms/cpt-loginforms.component";

@Component({
  selector: 'app-pgs-login',
  imports: [CptBannerComponent, CptLoginformsComponent],
  templateUrl: './pgs-login.component.html',
  styleUrl: './pgs-login.component.scss',
})
export class PgsLoginComponent {


  handleLogin(data: { email: string; password: string }) {
    console.log('Recebido do filho:', data);
    // Chamar serviço de autenticação, etc.
  }
}
