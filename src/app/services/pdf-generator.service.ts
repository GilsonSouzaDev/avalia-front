import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Pergunta } from '../interfaces/Pergunta';
import { Alternativa } from '../interfaces/Alternativa';
import {
  TDocumentDefinitions,
  Content,
  StyleDictionary,
} from 'pdfmake/interfaces';
import { AvaliacaoDraft } from '../interfaces/Avaliacao';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly INSTITUICAO_NOME = 'FATEC Guarulhos';

  constructor() {
    this.initializeFonts();
  }

  private initializeFonts() {
    try {
      const fontsModule = pdfFonts as any;
      if (fontsModule && fontsModule.pdfMake && fontsModule.pdfMake.vfs) {
        (pdfMake as any).vfs = fontsModule.pdfMake.vfs;
      } else if (
        fontsModule &&
        fontsModule.default &&
        fontsModule.default.pdfMake &&
        fontsModule.default.pdfMake.vfs
      ) {
        (pdfMake as any).vfs = fontsModule.default.pdfMake.vfs;
      } else if (fontsModule && fontsModule.vfs) {
        (pdfMake as any).vfs = fontsModule.vfs;
      }
    } catch (e) {
      console.error('Erro ao inicializar fontes do PDF:', e);
    }
  }

  async generatePdf(draft: AvaliacaoDraft): Promise<void> {
    if (!(pdfMake as any).vfs) {
      this.initializeFonts();
    }

    const cab = draft.cabecalho || {};

    const docDefinition: TDocumentDefinitions = {
      info: {
        title: cab.titulo || 'Avaliação',
        author: cab.professor || 'Professor',
      },
      pageSize: 'A4',
      // Margens: [esquerda, cima, direita, baixo]
      pageMargins: [30, 60, 30, 40],

      header: (currentPage, pageCount) => {
        return {
          stack: [
            {
              columns: [
                { text: cab.curso || 'Curso Geral', style: 'headerTopLeft' },
                { text: this.INSTITUICAO_NOME, style: 'headerTopRight' },
              ],
              margin: [30, 20, 30, 0],
            },
            {
              canvas: [
                { type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 1 },
              ],
              margin: [30, 0, 30, 0],
            },
          ],
        };
      },

      content: [
        this.buildExamMetadata(cab),
        this.buildStudentLine(cab),
        this.buildInstructions(cab),
        this.buildQuestions(draft),
      ],

      styles: this.getStyles(),

      footer: (currentPage, pageCount) => {
        return {
          text: `${currentPage} / ${pageCount}`,
          alignment: 'center',
          margin: [0, 10, 0, 0],
          fontSize: 9,
          color: '#555',
        };
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  private buildExamMetadata(cab: any): Content {
    return [
      {
        stack: [
          {
            text: this.INSTITUICAO_NOME,
            fontSize: 10,
            bold: false,
            alignment: 'center',
            margin: [0, 5, 0, 0],
          },
          {
            text: cab.titulo || 'Avaliação',
            fontSize: 14,
            bold: true,
            alignment: 'center',
            margin: [0, 2, 0, 15],
          },
        ],
      },
      {
        table: {
          headerRows: 0,
          widths: ['*', '*', 90],
          body: [
            [
              {
                text: [
                  { text: 'Disciplina: ', bold: true },
                  { text: cab.disciplina || '', bold: false },
                ],
                style: 'tableCell',
              },
              {
                text: [
                  { text: 'Professor: ', bold: true },
                  { text: cab.professor || '', bold: false },
                ],
                style: 'tableCell',
              },
              {
                text: [
                  { text: 'Pontos Totais:\n', bold: true },
                  { text: cab.totalPontos || '10.0', bold: false },
                ],
                style: 'tableCell',
              },
            ],
            [
              {
                text: [
                  { text: 'Turma: ', bold: true },
                  { text: cab.turma || '', bold: false },
                ],
                style: 'tableCell',
              },
              {
                text: [
                  { text: 'Período: ', bold: true },
                  { text: cab.periodo || '', bold: false },
                ],
                colSpan: 2,
                style: 'tableCell',
              },
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
        margin: [0, 0, 0, 15],
      },
    ];
  }

  private buildStudentLine(cab: any): Content {
    let dataFormatada = '__/__/____';
    if (cab.data) {
      const d = new Date(cab.data);
      if (!isNaN(d.getTime())) {
        dataFormatada = d.toLocaleDateString('pt-BR');
      }
    }

    return {
      stack: [
        {
          columns: [
            {
              text: [
                { text: 'Aluno(a): ', bold: true },
                '____________________________________________________________',
              ],
              width: '*',
            },
            {
              text: [{ text: 'Data: ', bold: true }, dataFormatada],
              width: 'auto',
            },
          ],
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 1.5 },
          ],
          margin: [0, 5, 0, 10],
        },
      ],
    } as Content;
  }

  // --- CORREÇÃO DE ALINHAMENTO AQUI ---
  private buildInstructions(cab: any): Content {
    const duracao = cab.duracao || '2 horas';

    return [
      { text: 'Instruções Gerais', style: 'sectionTitle' },
      {
        // Usamos COLUMNS para separar Texto do Quadrado, garantindo alinhamento perfeito
        columns: [
          {
            text: `Verifique se sua prova está completa. Leia com atenção cada questão antes de responder. A prova deve ser respondida com caneta esferográfica azul ou preta. Salvo disposição em contrário ou autorização expressa do professor, não é permitido o uso de equipamentos eletrônicos ou materiais de consulta. A interpretação das questões faz parte da avaliação. A duração da prova é de ${duracao}.`,
            style: 'instructionText',
            width: '*', // O texto ocupa todo o espaço disponível
          },
          {
            text: '☐',
            fontSize: 16, // Tamanho do quadrado
            alignment: 'right',
            width: 20, // Largura fixa para o quadrado não quebrar
            margin: [0, 0, 0, 0], // Margem zerada para alinhar com o topo do texto
          },
        ],
      },
      { text: 'Questões Objetivas', style: 'sectionTitle' },
    ];
  }

  private buildQuestions(draft: AvaliacaoDraft): Content {
    const content: Content[] = [];
    const questoes = draft.questoesSelecionadas || [];

    questoes.forEach((q: Pergunta, index: number) => {
      content.push({
        stack: [
          { text: `Questão ${index + 1}`, style: 'questionTitle' },
          { text: q.enunciado, margin: [0, 0, 0, 8], alignment: 'justify' },
        ],
        unbreakable: true,
      });

      if (q.alternativas && q.alternativas.length > 0) {
        q.alternativas.forEach((alt, i) => {
          content.push({
            text: [{ text: `(${this.getLetra(i)}) `, bold: true }, alt.texto],
            margin: [15, 2, 0, 2],
          });
        });
      } else {
        content.push({
          text: '\n\n__________________________________________________________\n\n',
          color: '#ccc',
        });
      }

      content.push({ text: '\n' });
    });

    return content;
  }

  private getLetra(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // --- AJUSTE DE ESTILOS ---
  private getStyles(): StyleDictionary {
    return {
      headerTopLeft: { fontSize: 9, alignment: 'left', italics: true },
      headerTopRight: { fontSize: 9, alignment: 'right', italics: true },
      tableCell: { fontSize: 10, color: 'black' },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 10, 0, 10],
        color: 'black',
      },

      // CORREÇÃO: Removemos o margin-right: 40 que empurrava o texto para longe
      instructionText: {
        fontSize: 10,
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      questionTitle: {
        fontSize: 10,
        bold: true,
        margin: [0, 10, 0, 5],
        color: 'black',
      },
    };
  }
}
