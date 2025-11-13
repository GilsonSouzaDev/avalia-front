import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Alternativa } from '../../interfaces/Alternativa';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cpt-alternativa-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cpt-alternativa-forms.component.html',
  styleUrl: './cpt-alternativa-forms.component.scss',
})
export class CptAlternativaFormsComponent {

  @Input() alternativa!: Alternativa;
  @Input() index!: number;
  @Input() editavel: boolean = true;

  @Output() textoChange = new EventEmitter<{ index: number; texto: string }>();

  editMode = false;
  textoTemp: string = '';

  ngOnInit(): void {
    this.textoTemp = this.alternativa.texto;
  }

  habilitarEdicao(): void {
    if (!this.editavel) return;
    this.editMode = true;
  }

  confirmarEdicao(): void {
    this.editMode = false;
    this.textoChange.emit({ index: this.index, texto: this.textoTemp });
  }

  cancelarEdicao(): void {
    this.editMode = false;
    this.textoTemp = this.alternativa.texto;
  }




}
