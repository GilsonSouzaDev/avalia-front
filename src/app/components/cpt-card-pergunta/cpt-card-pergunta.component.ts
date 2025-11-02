import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import {
  MatRadioModule,
  MatRadioGroup,
  MatRadioButton,
} from '@angular/material/radio';
import { Pergunta } from '../../interfaces/Pergunta';

@Component({
  selector: 'app-cpt-card-pergunta',
  imports: [MatCard, MatIcon, CommonModule],
  templateUrl: './cpt-card-pergunta.component.html',
  styleUrl: './cpt-card-pergunta.component.scss',
})
export class CptCardPerguntaComponent {
  @Input({ required: true }) pergunta!: Pergunta;

  expanded = false;

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }
}
