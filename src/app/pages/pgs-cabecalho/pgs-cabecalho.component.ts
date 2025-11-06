import { Component } from '@angular/core';
import { CptPerfilComponent } from "../../components/cpt-perfil/cpt-perfil.component";
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-pgs-cabecalho',
  imports: [CptPerfilComponent, RouterModule],
  templateUrl: './pgs-cabecalho.component.html',
  styleUrl: './pgs-cabecalho.component.scss'
})
export class PgsCabecalhoComponent {

}
