import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { Disciplina } from '../../interfaces/Disciplina';

@Component({
  selector: 'app-cpt-card-materia',
  imports: [MatButtonModule, RouterLink, MatIconModule],
  templateUrl: './cpt-card-materia.component.html',
  styleUrl: './cpt-card-materia.component.scss',
})
export class CptCardMateriaComponent {

  @Input() disciplina!: Disciplina;

  @Input() totalQuestoes: number = 0;

  questoes: string = 'Ver Questões';

}
