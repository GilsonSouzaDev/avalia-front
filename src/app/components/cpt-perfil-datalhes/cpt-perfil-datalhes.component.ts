import { Component, Input } from '@angular/core';
import { Professor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cpt-perfil-datalhes',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './cpt-perfil-datalhes.component.html',
  styleUrl: './cpt-perfil-datalhes.component.scss'
})
export class CptPerfilDatalhesComponent {
  @Input() professor!: Professor;
}
