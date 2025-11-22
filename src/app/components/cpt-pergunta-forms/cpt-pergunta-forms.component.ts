import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Disciplina } from '../../interfaces/Disciplina';
import { Pergunta } from '../../interfaces/Pergunta';
import { Alternativa } from '../../interfaces/Alternativa';

@Component({
  selector: 'app-cpt-pergunta-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cpt-pergunta-forms.component.html',
  styleUrl: './cpt-pergunta-forms.component.scss',
})
export class CptPerguntaFormsComponent implements OnInit, OnChanges {
  @Input() perguntaParaEdicao: Pergunta | null = null;
  @Input() disciplinas: Disciplina[] = [];
  @Output() submitForm = new EventEmitter<any>();

  titulo: string = 'Cadastro de Questão';
  textoBotao: string = 'Salvar';
  isEdicao: boolean = false;

  enunciado: string = '';
  disciplinaId: number | null = null;
  alternativas: Partial<Alternativa>[] = [];

  quantidadeAlternativas: number = 4;

  constructor() {
    this.resetForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['perguntaParaEdicao']) {
      this.isEdicao = !!this.perguntaParaEdicao;
      this.updateUI();
      this.loadFormModel();
    }

    if (
      changes['disciplinas'] &&
      this.disciplinas.length > 0 &&
      !this.disciplinaId
    ) {
      if (this.disciplinas.length === 1) {
        this.disciplinaId = this.disciplinas[0].id;
      }
    }
  }

  private resetForm(): void {
    this.enunciado = '';
    this.disciplinaId = null;
    this.alternativas = [
      { texto: '' },
      { texto: '' },
      { texto: '' },
      { texto: '' },
    ];
    this.quantidadeAlternativas = 4;
  }

  private updateUI(): void {
    this.titulo = this.isEdicao ? 'Edição de Questão' : 'Cadastro de Questão';
    this.textoBotao = this.isEdicao ? 'Atualizar' : 'Salvar';
  }

  private loadFormModel(): void {
    if (this.perguntaParaEdicao) {
      this.enunciado = this.perguntaParaEdicao.enunciado;
      this.disciplinaId = this.perguntaParaEdicao.disciplina?.id || null;

      this.alternativas = this.perguntaParaEdicao.alternativas.map((a) => ({
        ...a,
      }));

      this.quantidadeAlternativas = this.alternativas.length;
      this.adjustAlternativasArray(this.quantidadeAlternativas);
    } else {
      this.resetForm();
    }
  }

  private adjustAlternativasArray(targetCount: number): void {
    const currentCount = this.alternativas.length;

    if (currentCount < targetCount) {
      for (let i = currentCount; i < targetCount; i++) {
        this.alternativas.push({ texto: '' });
      }
    } else if (currentCount > targetCount) {
      this.alternativas.splice(targetCount);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      if (!this.disciplinaId) {
        return;
      }

      const alternativasParaEnviar = this.alternativas
        .slice(0, this.quantidadeAlternativas)
        .map((alt) => ({ texto: alt.texto || '' }))
        .filter((alt) => alt.texto.trim() !== '');

      const payload = {
        id: this.perguntaParaEdicao?.id,
        enunciado: this.enunciado,
        disciplinaId: this.disciplinaId,
        alternativas: alternativasParaEnviar,
      };

      this.submitForm.emit(payload);

      if (!this.isEdicao) {
        form.resetForm();
        this.resetForm();
      }
    }
  }

  setQuantidadeAlternativas(quantidade: number): void {
    this.quantidadeAlternativas = quantidade;
    this.adjustAlternativasArray(quantidade);
  }

  addAlternativa(): void {
    if (this.alternativas.length < 5) {
      this.alternativas.push({ texto: '' });
      this.quantidadeAlternativas = this.alternativas.length;
    }
  }

  removeAlternativa(index: number): void {
    if (this.alternativas.length <= 2) {
      return;
    }

    this.alternativas.splice(index, 1);
    this.quantidadeAlternativas = this.alternativas.length;
  }
}
