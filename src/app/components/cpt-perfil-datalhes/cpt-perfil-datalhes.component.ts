import { Component, Input } from '@angular/core';
import { Professor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';

@Component({
  selector: 'app-cpt-perfil-datalhes',
  standalone: true,
  imports: [],
  templateUrl: './cpt-perfil-datalhes.component.html',
  styleUrl: './cpt-perfil-datalhes.component.scss'
})
export class CptPerfilDatalhesComponent {

  @Input() professor!: Professor;




}
