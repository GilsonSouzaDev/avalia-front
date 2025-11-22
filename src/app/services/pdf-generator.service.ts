import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Pergunta } from '../interfaces/Pergunta';
import { AvaliacaoDraft } from '../interfaces/Avaliacao';
import {
  TDocumentDefinitions,
  Content,
  StyleDictionary,
} from 'pdfmake/interfaces';

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
      // Margem superior ajustada para 80 para acomodar o cabeçalho fixo
      pageMargins: [30, 80, 30, 40],

      // Cabeçalho fixo (Linha superior com Curso e Instituição)
      header: (currentPage, pageCount) => {
        return {
          stack: [
            {
              columns: [
                {
                  text: cab.curso || 'Análise e Desenvolvimento de Sistemas',
                  style: 'headerTopLeft',
                },
                {
                  text: this.INSTITUICAO_NOME,
                  style: 'headerTopRight',
                },
              ],
              margin: [30, 20, 30, 2],
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 535,
                  y2: 0,
                  lineWidth: 1,
                  lineColor: 'black',
                },
              ],
              margin: [30, 0, 30, 0],
            },
          ],
        };
      },

      content: [
        this.buildMainHeader(cab),
        this.buildMetadataTable(cab),
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
          color: '#333',
        };
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  private buildMainHeader(cab: any): Content {
    return {
      stack: [
        {
          text: this.INSTITUICAO_NOME,
          fontSize: 10,
          alignment: 'center',
          margin: [0, 5, 0, 2],
        },
        {
          text: cab.titulo || 'UNI FATEC',
          fontSize: 16,
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
      ],
    };
  }

  private buildMetadataTable(cab: any): Content {
    return {
      table: {
        widths: ['*', '*', 80],
        body: [
          [
            {
              text: [
                { text: 'Disciplina: ', bold: false },
                { text: cab.disciplina || '', bold: false },
              ],
              style: 'tableCell',
            },
            {
              text: [
                { text: 'Professor: ', bold: false },
                { text: cab.professor || '', bold: false },
              ],
              style: 'tableCell',
            },
            {
              text: [
                { text: 'Pontos Totais:\n', bold: false },
                { text: cab.totalPontos || '10.0', bold: false },
              ],
              style: 'tableCell',
            },
          ],
          [
            {
              text: [
                { text: 'Turma: ', bold: false },
                { text: cab.turma || '', bold: false },
              ],
              style: 'tableCell',
            },
            {
              text: [
                { text: 'Período: ', bold: false },
                { text: cab.periodo || '', bold: false },
              ],
              style: 'tableCell',
            },
            {
              text: '',
              style: 'tableCell',
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        paddingTop: () => 4,
        paddingBottom: () => 4,
        paddingLeft: () => 4,
        paddingRight: () => 4,
      },
      margin: [0, 0, 0, 20],
    };
  }

  private buildStudentLine(cab: any): Content {
    let dataFormatada = '';
    if (cab.data) {
      const d = new Date(cab.data);
      if (!isNaN(d.getTime())) {
        dataFormatada = d.toLocaleDateString('pt-BR');
      }
    }

    return {
      table: {
        widths: ['auto', '*', 'auto', 80],
        body: [
          [
            {
              text: 'Aluno(a): ',
              border: [false, false, false, true],
              margin: [0, 0, 0, 2],
            },
            {
              text: ' ',
              border: [false, false, false, true],
              margin: [0, 0, 0, 2],
            },
            {
              text: 'Data: ',
              border: [false, false, false, false],
              margin: [10, 0, 0, 2],
            },
            {
              text: dataFormatada,
              border: [false, false, false, false],
              margin: [0, 0, 0, 2],
            },
          ],
        ],
      },
      margin: [0, 0, 0, 20],
    };
  }

  // --- AQUI ESTÁ O AJUSTE SOLICITADO ---
  private buildInstructions(cab: any): Content {
    const duracao = cab.duracao || '4 horas';

    return [
      { text: 'Instruções Gerais', style: 'sectionTitle' },
      {
        // Texto composto (array) para permitir formatação individual
        text: [
          'Verifique se sua prova está completa. Leia com atenção cada questão antes de responder. A prova deve ser respondida com caneta esferográfica azul ou preta. Salvo disposição em contrário ou autorização expressa do professor, não é permitido o uso de equipamentos eletrônicos ou materiais de consulta. A interpretação das questões faz parte da avaliação. A duração da prova é de ',
          { text: duracao, bold: true }, // Apenas a duração em negrito
          '.',
        ],
        style: 'instructionText',
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
          { text: q.enunciado, style: 'questionBody' },
        ],
        unbreakable: true,
      });

      if (q.alternativas && q.alternativas.length > 0) {
        q.alternativas.forEach((alt, i) => {
          content.push({
            text: [{ text: `(${this.getLetra(i)}) `, bold: false }, alt.texto],
            style: 'alternativeText',
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

  private getStyles(): StyleDictionary {
    return {
      headerTopLeft: {
        fontSize: 9,
        italics: true,
        alignment: 'left',
        color: 'black',
      },
      headerTopRight: {
        fontSize: 9,
        italics: true,
        alignment: 'right',
        color: 'black',
      },
      tableCell: {
        fontSize: 10,
        color: 'black',
        alignment: 'left',
      },
      sectionTitle: {
        fontSize: 12,
        alignment: 'center',
        margin: [0, 15, 0, 10],
        color: 'black',
      },
      instructionText: {
        fontSize: 10,
        alignment: 'justify',
        lineHeight: 1.1,
        margin: [0, 0, 0, 15],
      },
      questionTitle: {
        fontSize: 10,
        margin: [0, 5, 0, 2],
        color: 'black',
        alignment: 'left',
      },
      questionBody: {
        fontSize: 10,
        alignment: 'justify',
        margin: [0, 0, 0, 5],
      },
      alternativeText: {
        fontSize: 10,
        margin: [10, 2, 0, 2],
        alignment: 'left',
      },
    };
  }
}
