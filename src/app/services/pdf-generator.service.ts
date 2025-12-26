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

  /**
   * Converte uma URL de imagem para Base64 para ser usada no PDFMake.
   */
  private async getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          reject(new Error('Falha ao criar contexto do canvas'));
        }
      };

      img.onerror = (error) => {
        console.warn('Erro ao carregar imagem para o PDF:', url, error);
        // Em caso de erro, resolve vazio para não quebrar a geração, apenas não mostra a imagem
        resolve('');
      };

      img.src = url;
    });
  }

  async generatePdf(draft: AvaliacaoDraft): Promise<void> {
    if (!(pdfMake as any).vfs) {
      this.initializeFonts();
    }

    // 1. Pré-processamento: Baixar e converter imagens das questões
    // Isso é necessário porque o pdfmake síncrono não baixa URLs durante a renderização
    const questoesComImagens = await Promise.all(
      (draft.questoesSelecionadas || []).map(async (q) => {
        if (q.imagem && q.imagem.trim() !== '') {
          try {
            const base64 = await this.getBase64ImageFromURL(q.imagem);
            // Retorna um objeto estendido (com propriedade temporária _imagemBase64)
            return { ...q, _imagemBase64: base64 };
          } catch (e) {
            return q;
          }
        }
        return q;
      })
    );

    const cab = draft.cabecalho || {};

    const docDefinition: TDocumentDefinitions = {
      info: {
        title: cab.titulo || 'Avaliação',
        author: cab.professor || 'Professor',
      },
      pageSize: 'A4',
      pageMargins: [30, 60, 30, 40],

      header: (currentPage, pageCount) => {
        return {
          stack: [
            {
              columns: [
                {
                  text: cab.curso || 'Análise e Desenvolvimento de Sistemas',
                  style: 'headerTopLeft',
                },
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
        this.buildQuestions(questoesComImagens), // Passamos a lista processada
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
            text: cab.titulo || 'UNI FATEC',
            fontSize: 16,
            bold: false,
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
                { text: 'Aluno(a): ', bold: false },
                '____________________________________________________________',
              ],
              width: '*',
            },
            {
              text: [{ text: 'Data: ', bold: false }, dataFormatada],
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

  private buildInstructions(cab: any): Content {
    const duracao = cab.duracao || '4 horas';

    return [
      { text: 'Instruções Gerais', style: 'sectionTitle' },
      {
        text: [
          'Verifique se sua prova está completa. Leia com atenção cada questão antes de responder. A prova deve ser respondida com caneta esferográfica azul ou preta. Salvo disposição em contrário ou autorização expressa do professor, não é permitido o uso de equipamentos eletrônicos ou materiais de consulta. A interpretação das questões faz parte da avaliação. A duração da prova é de ',
          { text: duracao, bold: true },
          '.',
        ],
        style: 'instructionText',
      },
      { text: 'Questões Objetivas', style: 'sectionTitle' },
    ];
  }

  private buildQuestions(questoes: any[]): Content {
    const content: Content[] = [];

    questoes.forEach((q: any, index: number) => {
      // 1. Stack inicial com Título e Enunciado
      const questionStack: any[] = [
        { text: `Questão ${index + 1}`, style: 'questionTitle' },
        { text: q.enunciado, margin: [0, 0, 0, 8], alignment: 'justify' },
      ];

      // 2. Se houver imagem processada, adiciona ao stack
      // Formatação profissional: Centralizada, fit para não estourar a página, margem superior e inferior
      if (q._imagemBase64) {
        questionStack.push({
          image: q._imagemBase64,
          fit: [450, 300], // Largura máx, Altura máx (mantém proporção)
          alignment: 'center',
          margin: [0, 10, 0, 15] // Margem para separar do enunciado e das alternativas
        });
      }

      // Adiciona o bloco da questão ao conteúdo principal
      content.push({
        stack: questionStack,
        unbreakable: true, // Tenta manter enunciado + imagem + início das alternativas juntos
      });

      // 3. Alternativas
      if (q.alternativas && q.alternativas.length > 0) {
        q.alternativas.forEach((alt: any, i: number) => {
          content.push({
            text: [{ text: `(${this.getLetra(i)}) `, bold: false }, alt.texto],
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

  private getStyles(): StyleDictionary {
    return {
      headerTopLeft: { fontSize: 9, alignment: 'left', italics: true },
      headerTopRight: { fontSize: 9, alignment: 'right', italics: true },
      tableCell: { fontSize: 10, color: 'black' },
      sectionTitle: {
        fontSize: 12,
        bold: false,
        alignment: 'center',
        margin: [0, 10, 0, 10],
        color: 'black',
      },
      instructionText: {
        fontSize: 10,
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },
      questionTitle: {
        fontSize: 10,
        bold: false,
        margin: [0, 10, 0, 5],
        color: 'black',
      },
    };
  }
}