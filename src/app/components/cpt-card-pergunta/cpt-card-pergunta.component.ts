import { Component, EventEmitter, Input, Output, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatTooltipModule,
    MatDialogModule,
    NomeProfessorPipe,
    CptAlternativaFormsComponent,
  ],
  templateUrl: './cpt-card-pergunta.component.html',
  styleUrls: ['./cpt-card-pergunta.component.scss'],
})
export class CptCardPerguntaComponent {
  @Input({ required: true }) pergunta!: Pergunta;
  @Input() professores: Professor[] = [];
  @Input() userTipo: string = '';
  @Input() isSelectionMode: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isDisabled: boolean = false;

  @Output() edit = new EventEmitter<Pergunta>();
  @Output() delete = new EventEmitter<number>();
  @Output() selectToggle = new EventEmitter<Pergunta>();
  @Output() editVariable = new EventEmitter<Alternativa>();

  expanded = false;
  private dialog = inject(MatDialog);

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
    if (!this.isSelectionMode && this.isCoordenador) {
      this.delete.emit(this.pergunta.id);
    }
  }

  onAlterarTexto(alternativa: Alternativa) {
    if (!this.isSelectionMode) {
      this.editVariable.emit(alternativa);
    }
  }

  getLetra(index: number): string {
    return String.fromCharCode(97 + index);
  }

  verImagem(event: MouseEvent, templateRef: TemplateRef<any>): void {
    event.stopPropagation();
    this.dialog.open(templateRef, {
      width: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'custom-image-dialog'
    });
  }
}