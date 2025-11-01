import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PgsCabecalhoComponent } from "./pages/pgs-cabecalho/pgs-cabecalho.component";
import { PgsNavegacaoComponent } from "./pages/pgs-navegacao/pgs-navegacao.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PgsCabecalhoComponent, PgsNavegacaoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'avalia-front';
}
