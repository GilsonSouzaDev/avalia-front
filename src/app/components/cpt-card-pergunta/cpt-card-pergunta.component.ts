import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pergunta } from '../../interfaces/Pergunta';
import { Professor } from '../../interfaces/Professor';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NomeProfessorPipe } from '../../pipes/nome-professor.pipe';
import { CommonModule } from '@angular/common';
import { CptAlternativaFormsComponent } from '../cpt-alternativa-forms/cpt-alternativa-forms.component';

@Component({
  selector: 'app-cpt-card-pergunta',
  standalone: true, // Adicionado standalone: true se não estava
  imports: [
    MatCard,
    MatIcon,
    NomeProfessorPipe,
    CommonModule,
    CptAlternativaFormsComponent,
  ],
  templateUrl: './cpt-card-pergunta.component.html',
  styleUrl: './cpt-card-pergunta.component.scss',
})
export class CptCardPerguntaComponent {
  @Input() pergunta!: Pergunta;
  @Input() professores: Professor[] = [];

  // NOVOS INPUTS PARA O MODO DE SELEÇÃO
  @Input() isSelectionMode: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isDisabled: boolean = false; // Para desabilitar se o limite for atingido

  @Output() edit = new EventEmitter<Pergunta>();
  @Output() delete = new EventEmitter<number>();
  // NOVO OUTPUT PARA A SELEÇÃO
  @Output() selectToggle = new EventEmitter<Pergunta>();

  expanded = false;

  toggleExpand(): void {
    // Só expande se não estiver no modo de seleção
    if (!this.isSelectionMode) {
      this.expanded = !this.expanded;
    }
  }

  onSelectToggle(): void {
    if (!this.isDisabled || this.isSelected) {
      this.selectToggle.emit(this.pergunta);
    }
  }

  onEdit(): void {
    // Só permite edição se não estiver no modo de seleção
    if (!this.isSelectionMode) {
      this.edit.emit(this.pergunta);
    }
  }

  onDelete(): void {
    // Só permite exclusão se não estiver no modo de seleção
    if (!this.isSelectionMode) {
      this.delete.emit(this.pergunta.id);
    }
  }

  onAlterarTexto(event: { index: number; texto: string }) {
    this.pergunta.alternativas[event.index].texto = event.texto;
  }

  onRemoverAlternativa(index: number) {
    this.pergunta.alternativas.splice(index, 1);
  }
}
