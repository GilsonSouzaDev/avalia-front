import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cpt-card-resumo',
  imports: [],
  templateUrl: './cpt-card-resumo.component.html',
  styleUrl: './cpt-card-resumo.component.scss',
})
export class CptCardResumoComponent {
  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() corTema: string = '';
}
