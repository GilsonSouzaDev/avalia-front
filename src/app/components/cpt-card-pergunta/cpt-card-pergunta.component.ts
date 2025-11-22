import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Pergunta } from '../../interfaces/Pergunta';
import { Professor } from '../../interfaces/Professor';
import { NomeProfessorPipe } from '../../pipes/nome-professor.pipe';
import { CptAlternativaFormsComponent } from '../cpt-alternativa-forms/cpt-alternativa-forms.component';
import { Alternativa } from '../../interfaces/Alternativa';

@Component({
  selector: 'app-cpt-card-pergunta',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NomeProfessorPipe,
    CptAlternativaFormsComponent,
  ],
  templateUrl: './cpt-card-pergunta.component.html',
  styleUrls: ['./cpt-card-pergunta.component.scss'],
})
export class CptCardPerguntaComponent {
  @Input({ required: true }) pergunta!: Pergunta;
  @Input() professores: Professor[] = [];

  // --- CONTROLE DE PERMISSÃO ---
  // Recebe o tipo do usuário: 'PROFESSOR' ou 'COORDENADOR'
  @Input() userTipo: string = '';

  // Estados do Card
  @Input() isSelectionMode: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isDisabled: boolean = false;

  @Output() edit = new EventEmitter<Pergunta>();
  @Output() delete = new EventEmitter<number>();
  @Output() selectToggle = new EventEmitter<Pergunta>();
  @Output() editVariable = new EventEmitter<Alternativa>();

  expanded = false;

  // Helper para verificar permissão.
  // Usa toUpperCase() para garantir que funcione mesmo se vier 'Coordenador' ou 'coordenador'
  get isCoordenador(): boolean {
    return this.userTipo?.toUpperCase() === 'COORDENADOR';
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  onSelectToggle(): void {
    if (!this.isDisabled || this.isSelected) {
      this.selectToggle.emit(this.pergunta);
    }
  }

  onEdit(): void {
    if (!this.isSelectionMode) {
      this.edit.emit(this.pergunta);
    }
  }

  onDelete(): void {
    // Garante que só emite o evento se for coordenador (segurança lógica)
    if (!this.isSelectionMode && this.isCoordenador) {
      this.delete.emit(this.pergunta.id);
    }
  }

  onAlterarTexto(alternativa: Alternativa) {
    if (!this.isSelectionMode) {
      this.editVariable.emit(alternativa);
      console.log(" card passou aqui", alternativa)
    }
  }

  getLetra(index: number): string {
    return String.fromCharCode(97 + index); // Retorna a, b, c...
  }
}
