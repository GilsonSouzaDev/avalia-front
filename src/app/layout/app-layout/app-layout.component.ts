import { Component } from '@angular/core';
import { PgsCabecalhoComponent } from "../../pages/pgs-cabecalho/pgs-cabecalho.component";
import { PgsNavegacaoComponent } from "../../pages/pgs-navegacao/pgs-navegacao.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-layout',
  imports: [PgsCabecalhoComponent, PgsNavegacaoComponent, RouterOutlet],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {

}
