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
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 

import { Disciplina } from '../../interfaces/Disciplina';
import { Pergunta, CadastrarPergunta } from '../../interfaces/Pergunta';
import { Alternativa } from '../../interfaces/Alternativa';
import { CptAlternativaFormsComponent } from "../cpt-alternativa-forms/cpt-alternativa-forms.component";

// Importando nossa nova classe
import { PerguntaFormUtils } from '../../utils/pergunta-form.utils';

@Component({
  selector: 'app-cpt-pergunta-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, CptAlternativaFormsComponent],
  templateUrl: './cpt-pergunta-forms.component.html',
  styleUrl: './cpt-pergunta-forms.component.scss',
})
export class CptPerguntaFormsComponent implements OnInit, OnChanges {
  @Input() perguntaParaEdicao: Pergunta | null = null;
  @Input() disciplinas: Disciplina[] = [];
  @Input() professorId: number | null = null;

  @Output() submitForm = new EventEmitter<CadastrarPergunta | Pergunta>();

  titulo: string = 'Cadastro de Questão';
  textoBotao: string = 'Salvar';
  isEdicao: boolean = false;

  // Dados do Formulário
  enunciado: string = '';
  disciplinaId: number | null = null;
  alternativas: Alternativa[] = [];
  quantidadeAlternativas: number = 4;
  
  // Imagem
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    // Inicializa via Utils
    this.alternativas = PerguntaFormUtils.gerarAlternativasIniciais();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['perguntaParaEdicao'] && this.perguntaParaEdicao) {
      this.isEdicao = true;
      this.carregarDadosEdicao();
    }
    
    // Auto-select disciplina se só houver uma
    if (changes['disciplinas'] && this.disciplinas.length === 1 && !this.isEdicao) {
      this.disciplinaId = this.disciplinas[0].id;
    }
    
    this.atualizarTextosUI();
  }

  // --- GETTERS & SETTERS SIMPLIFICADOS ---

  get isAlternativasValidas(): boolean {
    return PerguntaFormUtils.isFormularioValido(this.alternativas, this.quantidadeAlternativas);
  }

  setQuantidadeAlternativas(qtd: number): void {
    this.quantidadeAlternativas = qtd;
    this.alternativas = PerguntaFormUtils.ajustarQuantidadeAlternativas(this.alternativas, qtd);
  }

  definirCorreta(index: number): void {
    PerguntaFormUtils.definirUnicaCorreta(this.alternativas, index);
  }

  onAlternativaChange(alt: Alternativa, index: number): void {
    this.alternativas[index] = alt;
  }

  // --- CARREGAMENTO DE DADOS ---

  private carregarDadosEdicao(): void {
    if (!this.perguntaParaEdicao) return;

    this.enunciado = this.perguntaParaEdicao.enunciado;
    this.disciplinaId = this.perguntaParaEdicao.disciplina?.id || null;
    
    if (!this.professorId) {
      this.professorId = this.perguntaParaEdicao.professorId;
    }

    // Imagem existente
    if (this.perguntaParaEdicao.imagem) {
      this.imagePreview = this.perguntaParaEdicao.imagem;
    }

    // Clona alternativas para não mutar a prop original
    this.alternativas = this.perguntaParaEdicao.alternativas.map(a => ({ ...a }));
    
    // Ajusta quantidade visual
    this.quantidadeAlternativas = this.alternativas.length < 4 ? 4 : this.alternativas.length;
    this.setQuantidadeAlternativas(this.quantidadeAlternativas);
  }

  private atualizarTextosUI(): void {
    this.titulo = this.isEdicao ? 'Edição de Questão' : 'Cadastro de Questão';
    this.textoBotao = this.isEdicao ? 'Atualizar' : 'Salvar';
  }

  // --- UPLOAD DE IMAGEM (UI LOGIC) ---
  // Mantemos no componente pois lida com FileReader (API do Browser/UI)
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // --- SUBMIT ---

  onSubmit(form: NgForm): void {
    // Toda a complexidade de criar objeto foi para o Utils
    const payload = PerguntaFormUtils.montarPayload({
      isEdicao: this.isEdicao,
      perguntaEdicao: this.perguntaParaEdicao,
      enunciado: this.enunciado,
      disciplinaId: this.disciplinaId,
      professorId: this.professorId,
      alternativas: this.alternativas,
      qtdVisivel: this.quantidadeAlternativas,
      imagemFile: this.selectedFile
    });

    if (!payload) {
      console.error('Erro de validação: Disciplina ou Professor faltando.');
      return;
    }

    console.log('Enviando Payload:', payload);
    this.submitForm.emit(payload);

    if (!this.isEdicao) {
      this.resetarFormularioLocal(form);
    }
  }

  private resetarFormularioLocal(form: NgForm): void {
    form.resetForm();
    this.enunciado = '';
    this.disciplinaId = null;
    this.removeImage();
    this.setQuantidadeAlternativas(4);
    this.alternativas = PerguntaFormUtils.gerarAlternativasIniciais();
  }
}