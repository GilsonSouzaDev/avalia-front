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
  @Input() perguntaParaEdicao!: Pergunta;
  @Input() disciplinas: Disciplina[] = [];
  @Output() submitForm = new EventEmitter<Pergunta>();

  titulo: string = 'Cadastro de Questão';
  textoBotao: string = 'Salvar';
  isEdicao: boolean = false;

  formModel: Pergunta = this.getInitialFormModel();
  quantidadeAlternativas: number = 4; // Variável separada para controle de UI
  readonly alternativaCounts: number[] = [4, 5];

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['perguntaParaEdicao']) {
      this.isEdicao = !!this.perguntaParaEdicao;
      this.updateUI();
      this.loadFormModel();
    }

    if (changes['disciplinas'] && this.disciplinas.length > 0) {
      this.updateDisciplinaSelection();
    }
  }

  private getInitialFormModel(): Pergunta {
    return {
      id: 0,
      enunciado: '',
      codigoProfessor: 0,
      disciplinaId: 0,
      alternativas: [
        this.createAlternativa(''),
        this.createAlternativa(''),
        this.createAlternativa(''),
        this.createAlternativa(''),
      ],
    };
  }

  private createAlternativa(texto: string): Alternativa {
    return {
      id: 0,
      texto,
      perguntaId: this.formModel?.id, // ✅ referência correta
    };
  }

  private updateUI(): void {
    this.titulo = this.isEdicao ? 'Edição de Questão' : 'Cadastro de Questão';
    this.textoBotao = this.isEdicao ? 'Atualizar' : 'Salvar';
  }

  private loadFormModel(): void {
    if (this.perguntaParaEdicao) {
      this.formModel = JSON.parse(JSON.stringify(this.perguntaParaEdicao));
      // Se estiver editando, usa a quantidade baseada nas alternativas existentes
      this.quantidadeAlternativas = this.formModel.alternativas.length;
      this.adjustAlternativasArray(this.quantidadeAlternativas);
    } else {
      this.formModel = this.getInitialFormModel();
    }
  }

  private updateDisciplinaSelection(): void {
    if (this.disciplinas.length === 1 && this.formModel.disciplinaId === 0) {
      this.formModel.disciplinaId = this.disciplinas[0].id;
    }
  }

  private adjustAlternativasArray(targetCount: number): void {
    const currentCount = this.formModel.alternativas.length;

    if (currentCount < targetCount) {
      for (let i = currentCount; i < targetCount; i++) {
        this.formModel.alternativas.push(this.createAlternativa(''));
      }
    } else if (currentCount > targetCount) {
      this.formModel.alternativas.splice(targetCount);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      if (!this.formModel.disciplinaId || this.formModel.disciplinaId === 0) {
        console.error('Selecione uma disciplina');
        return;
      }

      const alternativasParaEnviar = this.formModel.alternativas
        .slice(0, this.quantidadeAlternativas)
        .filter((alt) => alt.texto.trim() !== '');

      const dataToEmit: Pergunta = {
        ...this.formModel,
        alternativas: alternativasParaEnviar,
      };

      delete (dataToEmit as any).quantidadeAlternativas;

      this.submitForm.emit(dataToEmit);

      if (!this.isEdicao) {
        this.formModel = this.getInitialFormModel();
        this.quantidadeAlternativas = 4;
        this.updateDisciplinaSelection();
        form.resetForm(this.formModel);
      }
    }
  }

  setQuantidadeAlternativas(quantidade: number): void {
    this.quantidadeAlternativas = quantidade;
    this.adjustAlternativasArray(quantidade);
  }

  addAlternativa(): void {
    if (this.formModel.alternativas.length < 5) {
      this.formModel.alternativas.push(this.createAlternativa(''));
      this.quantidadeAlternativas = this.formModel.alternativas.length;
    }
  }

  removeAlternativa(index: number): void {
    const total = this.formModel.alternativas.length;

    if (total <= 4) {
      console.warn('Não é permitido ter menos de 4 alternativas.');
      return;
    }

    this.formModel.alternativas.splice(index, 1);
    this.quantidadeAlternativas = this.formModel.alternativas.length;
  }

  getDisciplinaSelecionada(): string {
    const disciplina = this.disciplinas.find(
      (d) => d.id === this.formModel.disciplinaId
    );
    return disciplina ? disciplina.nome : 'Selecione uma disciplina';
  }
}
