import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DISCIPLINAS_MOCK } from '../../data/disciplina';

@Component({
  selector: 'app-cpt-professor-forms',
  imports: [FormsModule, CommonModule],
  templateUrl: './cpt-professor-forms.component.html',
  styleUrl: './cpt-professor-forms.component.scss',
})
export class CptProfessorFormsComponent {
  @Input() professor?: Professor;
  @Input() mostrarDisciplinas: boolean = true;
  @Output() salvar = new EventEmitter<Professor>();

  disciplinasDisponiveis: Disciplina[] = DISCIPLINAS_MOCK;
  disciplinasSelecionadas: Disciplina[] = [];

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  erroSenha = '';

  get editando(): boolean {
    return !!this.professor;
  }

  ngOnInit() {
    if (this.professor) {
      this.nome = this.professor.nome;
      this.email = this.professor.email;
      this.senha = '';
      this.confirmarSenha = '';
      this.disciplinasSelecionadas = [...this.professor.disciplinas];
    }

    this.validarSenhas();
  }

  isDisciplinaSelecionada(disciplina: Disciplina): boolean {
    return this.disciplinasSelecionadas.some((x) => x.id === disciplina.id);
  }

  onDisciplinaChange(event: Event, disciplina: Disciplina) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    if (input.checked) {
      this.disciplinasSelecionadas.push(disciplina);
    } else {
      this.disciplinasSelecionadas = this.disciplinasSelecionadas.filter(
        (x) => x.id !== disciplina.id
      );
    }
  }

  validarSenhas() {
    if (!this.senha) {
      this.confirmarSenha = '';
      this.erroSenha = '';
      return;
    }

    if (
      this.senha &&
      this.confirmarSenha &&
      this.senha !== this.confirmarSenha
    ) {
      this.erroSenha = 'As senhas não coincidem.';
    } else {
      this.erroSenha = '';
    }
  }

  isFormValid(): boolean {

    if (!this.nome.trim() || !this.email.trim()) return false;
    if (!this.editando) {
      if (!this.senha.trim()) return false;
      if (this.senha.trim() && this.confirmarSenha.trim() !== this.senha.trim())
        return false;
    }
    
    if (this.editando && this.senha.trim()) {
      if (
        !this.confirmarSenha.trim() ||
        this.confirmarSenha.trim() !== this.senha.trim()
      )
        return false;
    }

    // Nenhum erro de senha
    if (this.erroSenha) return false;

    return true;
  }

  onSubmit(form: NgForm) {
    this.validarSenhas();
    if (this.erroSenha) return;
    if (!this.editando && !this.senha) return;

    const novoProfessor: Professor = {
      id: this.professor?.id ?? 0,
      nome: this.nome,
      email: this.email,
      senha: this.senha || this.professor?.senha || '',
      tipo: TipoProfessor.PROFESSOR,
      disciplinas: this.disciplinasSelecionadas,
    };

    this.salvar.emit(novoProfessor);
    form.resetForm();
    this.disciplinasSelecionadas = [];
    this.erroSenha = '';
  }
}
