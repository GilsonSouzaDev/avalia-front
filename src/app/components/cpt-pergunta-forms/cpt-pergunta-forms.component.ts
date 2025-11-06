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
import { FormsModule, NgForm } from '@angular/forms'; // Importando FormsModule

// Interfaces para a estrutura de dados
interface Alternativa {
  id?: number;
  texto: string;
}

export interface PerguntaForm {
  id?: number;
  materia: string;
  // Renomeado para refletir a quantidade de alternativas
  quantidadeAlternativas: number;
  textoQuestao: string;
  alternativas: Alternativa[];
}

@Component({
  selector: 'app-cpt-pergunta-forms',
  standalone: true,
  imports: [CommonModule, FormsModule], // Usando FormsModule
  templateUrl: './cpt-pergunta-forms.component.html',
  styleUrl: './cpt-pergunta-forms.component.scss',
})
export class CptPerguntaFormsComponent implements OnInit, OnChanges {

  @Input() perguntaParaEdicao: PerguntaForm | null = null;

  @Output() submitForm = new EventEmitter<PerguntaForm>();

  // Propriedades de controle de UI
  titulo: string = 'Cadastro de Questão';
  textoBotao: string = 'Salvar';
  isEdicao: boolean = false;

  // Modelo de dados para o Template-Driven Form
  formModel: PerguntaForm = this.getInitialFormModel();

  // Array para controlar o número de alternativas a serem exibidas/criadas
  readonly alternativaCounts: number[] = [4, 5];

  constructor() {}

  ngOnInit(): void {
    // A inicialização do formulário e preenchimento é tratada em ngOnChanges
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['perguntaParaEdicao']) {
      this.isEdicao = !!this.perguntaParaEdicao;
      this.updateUI();
      this.loadFormModel();
    }
  }

  private getInitialFormModel(): PerguntaForm {
    return {
      id: undefined,
      materia: '',
      quantidadeAlternativas: 4, // Padrão de 4 alternativas
      textoQuestao: '',
      alternativas: [
        { texto: '' },
        { texto: '' },
        { texto: '' },
        { texto: '' },
      ],
    };
  }

  private updateUI(): void {
    this.titulo = this.isEdicao ? 'Edição de Questão' : 'Cadastro de Questão';
    this.textoBotao = this.isEdicao ? 'Atualizar' : 'Salvar';
  }

  private loadFormModel(): void {
    if (this.perguntaParaEdicao) {
      // Cria uma cópia profunda para evitar mutação do Input
      this.formModel = JSON.parse(JSON.stringify(this.perguntaParaEdicao));
      // Garante que o formModel tenha o número correto de alternativas
      this.adjustAlternativasArray(this.formModel.quantidadeAlternativas);
    } else {
      this.formModel = this.getInitialFormModel();
    }
  }

  private adjustAlternativasArray(targetCount: number): void {
    const currentCount = this.formModel.alternativas.length;

    if (currentCount < targetCount) {
      // Adiciona alternativas vazias
      for (let i = currentCount; i < targetCount; i++) {
        this.formModel.alternativas.push({ texto: '' });
      }
    } else if (currentCount > targetCount) {
      // Remove alternativas excedentes
      this.formModel.alternativas.splice(targetCount);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      // Filtra alternativas vazias, se necessário, antes de emitir
      const dataToEmit: PerguntaForm = {
        ...this.formModel,
        // Garante que apenas as alternativas preenchidas e dentro do limite sejam enviadas
        alternativas: this.formModel.alternativas
          .slice(0, this.formModel.quantidadeAlternativas)
          .filter((alt) => alt.texto.trim() !== ''),
      };

      this.submitForm.emit(dataToEmit);

      // Opcional: resetar o formulário após o envio, se for um cadastro
      if (!this.isEdicao) {
        this.formModel = this.getInitialFormModel();
        form.resetForm(this.formModel); // Reseta o estado do formulário e os valores
      }
    }
  }

  // Lógica para controle de quantidade de alternativas
  setQuantidadeAlternativas(quantidade: number): void {
    this.formModel.quantidadeAlternativas = quantidade;
    this.adjustAlternativasArray(quantidade);
  }

  // Métodos de manipulação de array (mantidos para flexibilidade, mas o foco é o seletor)
  addAlternativa(): void {
    // Adiciona apenas se não exceder o máximo permitido (5)
    if (this.formModel.alternativas.length < 5) {
      this.formModel.alternativas.push({ texto: '' });
      this.formModel.quantidadeAlternativas =
        this.formModel.alternativas.length;
    }
  }

  removeAlternativa(index: number): void {
    if (this.formModel.alternativas.length > 4) {
      // Garante um mínimo de 4 alternativas
      this.formModel.alternativas.splice(index, 1);
      this.formModel.quantidadeAlternativas =
        this.formModel.alternativas.length;
    }
  }
}
