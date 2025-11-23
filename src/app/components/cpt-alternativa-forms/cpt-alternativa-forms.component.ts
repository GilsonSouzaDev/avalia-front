import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Alternativa } from '../../interfaces/Alternativa';

@Component({
  selector: 'app-cpt-alternativa-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './cpt-alternativa-forms.component.html',
  styleUrl: './cpt-alternativa-forms.component.scss',
})
export class CptAlternativaFormsComponent implements OnInit {
  @Input() alternativa!: Alternativa;
  @Input() index!: number;
  @Input() editavel: boolean = true;

  @Output() textoChange = new EventEmitter<Alternativa>();

  editMode = false;
  textoTemp: string = '';

  ngOnInit(): void {
    this.textoTemp = this.alternativa?.texto || '';
  }

  habilitarEdicao(): void {
    if (!this.editavel) return;
    this.textoTemp = this.alternativa.texto;
    this.editMode = true;
  }

  confirmarEdicao(): void {

    const textoAntigo = this.alternativa.texto;
    this.alternativa.texto = this.textoTemp;
    
    this.editMode = false;

    this.textoChange.emit(this.alternativa);
    console.log('Enviando para salvar:', this.alternativa);
  }

  cancelarEdicao(): void {
    this.editMode = false;
    this.textoTemp = this.alternativa.texto;
  }
}
