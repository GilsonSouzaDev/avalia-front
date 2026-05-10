import { Component } from '@angular/core';
import { PgsCabecalhoComponent } from '../../pages/pgs-cabecalho/pgs-cabecalho.component';
import { PgsNavegacaoComponent } from '../../pages/pgs-navegacao/pgs-navegacao.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    PgsCabecalhoComponent,
    PgsNavegacaoComponent,
    RouterOutlet,
    CommonModule,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {

  menuAberto = false;
  
}
