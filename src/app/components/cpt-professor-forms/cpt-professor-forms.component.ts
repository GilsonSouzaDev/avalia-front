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
import { AuthService } from '../../core/auth.service';
import { MOCK_DISCIPLINAS } from '../../data/mock-data';

@Component({
  selector: 'app-cpt-professor-forms',
  standalone: true, // Garanta que é standalone se estiver usando imports diretos
  imports: [FormsModule, CommonModule],
  templateUrl: './cpt-professor-forms.component.html',
  styleUrl: './cpt-professor-forms.component.scss',
})
export class CptProfessorFormsComponent implements OnInit {
  // ATENÇÃO: Se no pai você usa [professorParaEdicao], renomeie aqui ou mude no HTML do pai.
  // Vou manter 'professor' conforme seu código atual, mas verifique o bind no pai.
  @Input() professor: Professor | null = null;
  @Input() mostrarDisciplinas: boolean = true;

  @Output() salvar = new EventEmitter<Professor>();
  @Output() cancelar = new EventEmitter<void>();

  public authService = inject(AuthService);

  disciplinasDisponiveis: Disciplina[] = MOCK_DISCIPLINAS;
  disciplinasSelecionadas: Disciplina[] = [];

  // Inicializando com strings vazias para evitar undefined
  codigo = 0;
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
      // Proteção || '' caso venha null do backend/mock
      this.nome = this.professor.nome || '';
      this.email = this.professor.email || '';
      this.codigo = this.professor.codigo;
      this.senha = '';
      this.confirmarSenha = '';
      this.disciplinasSelecionadas = this.professor.disciplinas
        ? [...this.professor.disciplinas]
        : [];
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
    // Garante que senha não seja null antes de comparar
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

  // AQUI ESTAVA O ERRO: Adicionada proteção (|| '') antes do .trim()
  isFormValid(): boolean {
    const nome = this.nome || '';
    const email = this.email || '';
    const senha = this.senha || '';
    const confirmar = this.confirmarSenha || '';

    if (!nome.trim() || !email.trim()) return false;

    // Regras para cadastro (Senha obrigatória)
    if (!this.editando) {
      if (!senha.trim()) return false;
      if (senha.trim() && confirmar.trim() !== senha.trim()) return false;
    }

    // Regras para edição (Senha opcional, mas se digitada deve conferir)
    if (this.editando && senha.trim()) {
      if (!confirmar.trim() || confirmar.trim() !== senha.trim()) return false;
    }

    if (this.erroSenha) return false;

    return true;
  }

  onSubmit(form: NgForm) {
    this.validarSenhas();
    if (this.erroSenha) return;

    // Proteção extra
    const senha = this.senha || '';
    if (!this.editando && !senha) return;

    const novoProfessor: Professor = {
      id: this.professor?.id ?? 0,
      codigo: this.codigo,
      nome: this.nome,
      email: this.email,
      // Se editando e senha vazia, mantém a antiga (se existir)
      senha: senha || this.professor?.senha || '',
      perfilProfessor: this.tipoProfessor,
      disciplinas: this.disciplinasSelecionadas,
    };

    this.salvar.emit(novoProfessor);

    // Reset cuidadoso para evitar nulls indesejados
    form.resetForm();
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';
    this.disciplinasSelecionadas = [];
    this.erroSenha = '';
  }

  get currentUser(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  tipoProfessor = this.currentUser
    ? this.currentUser.perfilProfessor
    : TipoProfessor.PROFESSOR;

  cancelarCadastro() {
    this.cancelar.emit();
  }
}
