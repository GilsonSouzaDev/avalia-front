import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cpt-card-materia',
  imports: [MatButtonModule, RouterLink, MatIconModule],
  templateUrl: './cpt-card-materia.component.html',
  styleUrl: './cpt-card-materia.component.scss',
})
export class CptCardMateriaComponent {
  @Input() materia: string = '';
  @Input() totalQuestoes: string = '';
  questoes: string = 'Ver Questões';
}
