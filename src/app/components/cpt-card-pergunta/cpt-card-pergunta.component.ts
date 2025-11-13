import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pergunta } from '../../interfaces/Pergunta';
import { Professor } from '../../interfaces/Professor';
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { NomeProfessorPipe } from "../../pipes/nome-professor.pipe";
import { CommonModule } from '@angular/common';
import { CptAlternativaFormsComponent } from "../cpt-alternativa-forms/cpt-alternativa-forms.component";

@Component({
  selector: 'app-cpt-card-pergunta',
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

  @Output() edit = new EventEmitter<Pergunta>();
  @Output() delete = new EventEmitter<number>();

  expanded = false;

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  onEdit(): void {
    this.edit.emit(this.pergunta);
  }

  onDelete(): void {
    this.delete.emit(this.pergunta.id);
  }

  onAlterarTexto(event: { index: number; texto: string }) {
    this.pergunta.alternativas[event.index].texto = event.texto;
  }

  onRemoverAlternativa(index: number) {
    this.pergunta.alternativas.splice(index, 1);
  }
}
