import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CptPerfilComponent } from '../../components/cpt-perfil/cpt-perfil.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pgs-cabecalho',
  standalone: true,
  imports: [CptPerfilComponent, RouterModule, CommonModule],
  templateUrl: './pgs-cabecalho.component.html',
  styleUrl: './pgs-cabecalho.component.scss',
})
export class PgsCabecalhoComponent {
  @Input() menuAberto = false;
  @Output() toggleMenu = new EventEmitter<void>();
}
