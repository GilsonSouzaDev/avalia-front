import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Professor, TipoProfessor } from '../../interfaces/Professor';
import { Disciplina } from '../../interfaces/Disciplina';
import { DisciplinaService } from '../../services/disciplina.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-cpt-professor-forms',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cpt-professor-forms.component.html',
  styleUrl: './cpt-professor-forms.component.scss',
})
export class CptProfessorFormsComponent implements OnInit {
  @Input() professorAtivo: Professor | null = null;
  @Input() mostrarDisciplinas: boolean = true;

  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  private authService = inject(AuthService);
  private disciplinaService = inject(DisciplinaService);

  disciplinasDisponiveis = this.disciplinaService.disciplinas;
  disciplinasSelecionadas: Disciplina[] = [];

  codigo: number | null = null;
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  erroSenha = '';
  perfilSelecionado: TipoProfessor = TipoProfessor.PROFESSOR;

  get editando(): boolean {
    return !!this.professorAtivo;
  }

  ngOnInit() {
    if (this.professorAtivo) {
      this.nome = this.professorAtivo.nome || '';
      this.email = this.professorAtivo.email || '';
      this.codigo = this.professorAtivo.codigo;
      this.perfilSelecionado = this.professorAtivo.perfilProfessor;
      this.senha = '';
      this.confirmarSenha = '';

      if (this.professorAtivo.disciplinas) {
        const todas = this.disciplinasDisponiveis();
        const idsProfessor = this.professorAtivo.disciplinas.map((d) => d.id);
        this.disciplinasSelecionadas = todas.filter((d) =>
          idsProfessor.includes(d.id)
        );
      } else {
        this.disciplinasSelecionadas = [];
      }
    } else {
      this.perfilSelecionado = TipoProfessor.PROFESSOR;
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
    const s = this.senha || '';
    const c = this.confirmarSenha || '';

    if (!s) {
      this.erroSenha = '';
      return;
    }

    if (s && c && s !== c) {
      this.erroSenha = 'As senhas não coincidem.';
    } else {
      this.erroSenha = '';
    }
  }

  isFormValid(): boolean {
    const nome = this.nome || '';
    const email = this.email || '';
    const senha = this.senha || '';
    const confirmar = this.confirmarSenha || '';

    if (!this.codigo || !nome.trim() || !email.trim()) return false;

    if (!this.editando) {
      if (!senha.trim()) return false;
      if (senha.trim() && confirmar.trim() !== senha.trim()) return false;
    }

    if (this.editando && senha.trim()) {
      if (!confirmar.trim() || confirmar.trim() !== senha.trim()) return false;
    }

    if (this.erroSenha) return false;

    return true;
  }

  onSubmit(form: NgForm) {
    this.validarSenhas();
    if (this.erroSenha) return;

    const senha = this.senha || '';
    if (!this.editando && !senha) return;

    const professorPayload: any = {
      id: this.professorAtivo?.id,
      codigo: this.codigo,
      nome: this.nome,
      email: this.email,
      perfilProfessor: this.perfilSelecionado,
      disciplinasIds: this.disciplinasSelecionadas.map((d) => d.id),
    };

    if (senha) {
      professorPayload.senha = senha;
    }

    this.onSave.emit(professorPayload);

    form.resetForm();
    this.limparCampos();
  }

  limparCampos() {
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';
    this.codigo = null;
    this.disciplinasSelecionadas = [];
    this.erroSenha = '';
  }

  cancelarCadastro() {
    this.onCancel.emit();
  }
}
