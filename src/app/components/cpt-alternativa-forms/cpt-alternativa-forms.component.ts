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
  @Output() selectionRequest = new EventEmitter<void>();

  editMode = false;
  textoTemp: string = '';

  ngOnInit(): void {
    this.textoTemp = this.alternativa?.texto || '';
    
    if (!this.alternativa.texto) {
      this.editMode = true;
    }
  }

  habilitarEdicao(): void {
    if (!this.editavel) return;
    this.textoTemp = this.alternativa.texto;
    this.editMode = true;
  }

  confirmarEdicao(): void {
    if (!this.textoTemp || this.textoTemp.trim() === '') {
      return;
    }
    this.alternativa.texto = this.textoTemp;
    this.editMode = false;
    this.emitirMudanca();
  }

  cancelarEdicao(): void {
    if (!this.alternativa.texto && (!this.textoTemp || this.textoTemp.trim() === '')) {
       return;
    }
    this.editMode = false;
    this.textoTemp = this.alternativa.texto;
  }

  // Ação Mesclada: O clique no ícone dispara a seleção (como o toggle fazia)
  solicitarSelecao(event: MouseEvent): void {
    event.stopPropagation();
    
    // Se estiver editando o texto, bloqueamos a mudança de seleção para evitar confusão
    if (!this.editMode) {
      this.selectionRequest.emit();
    }
  }

  private emitirMudanca(): void {
    this.textoChange.emit(this.alternativa);
  }

  get isTextoValido(): boolean {
    return !!(this.textoTemp && this.textoTemp.trim().length > 0);
  }
}