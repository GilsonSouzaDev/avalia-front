import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AvaliacaoDraft } from '../interfaces/Avaliacao';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

@Injectable({
  providedIn: 'root',
})
export class CadernoAlunoGeneratorService {
  
  constructor() {
    this.initializeFonts();
  }

  private initializeFonts() {
    try {
      const fontsModule = pdfFonts as any;
      if (fontsModule && fontsModule.pdfMake && fontsModule.pdfMake.vfs) {
        (pdfMake as any).vfs = fontsModule.pdfMake.vfs;
      } else if (fontsModule && fontsModule.default && fontsModule.default.pdfMake && fontsModule.default.pdfMake.vfs) {
        (pdfMake as any).vfs = fontsModule.default.pdfMake.vfs;
      } else if (fontsModule && fontsModule.vfs) {
        (pdfMake as any).vfs = fontsModule.vfs;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async generateAnswerSheet(draft: AvaliacaoDraft): Promise<void> {
    const cab = draft.cabecalho || {};
    const totalQuestoesReal = (draft.questoesSelecionadas || []).length;
    const totalGrade = totalQuestoesReal > 60 ? totalQuestoesReal : 60;

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [30, 30, 30, 30],
      info: {
        title: 'Folha de Respostas',
        author: 'Sistema de Avaliação',
      },
      content: [
        this.buildHeader(cab),
        this.buildInstructions(),
        this.buildAnswerGrid(totalGrade, totalQuestoesReal),
        this.buildFooter()
      ],
      styles: {
        headerTitle: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
        headerSub: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 2] },
        instructionTitle: { fontSize: 9, bold: true, margin: [0, 10, 0, 2] },
        instructionText: { fontSize: 8, alignment: 'justify', color: '#333' },
        questionNum: { fontSize: 9, bold: true, alignment: 'right' },
        footerText: { fontSize: 8, italics: true, alignment: 'center', margin: [0, 20, 0, 0] },
        columnHeaderLetters: { fontSize: 7, bold: true, alignment: 'left' }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  private buildHeader(cab: any): Content {
    return {
      stack: [
        { text: 'FOLHA DE RESPOSTAS', style: 'headerTitle' },
        { text: cab.curso?.toUpperCase() || 'CURSO', style: 'headerSub' },
        { text: cab.titulo?.toUpperCase() || 'AVALIAÇÃO', style: 'headerSub' },
        {
          margin: [0, 15, 0, 10],
          table: {
            widths: ['*', 100],
            body: [
              [
                { 
                  text: 'NOME DO CANDIDATO:\n\n', 
                  fontSize: 8, 
                  border: [true, true, true, false] 
                },
                { 
                  text: 'DATA:\n\n__/__/____', 
                  fontSize: 8, 
                  border: [true, true, true, false] 
                }
              ],
              [
                { 
                  text: '___________________________________________________________', 
                  fontSize: 10, margin: [0, -5, 0, 5], 
                  border: [true, false, true, true] 
                },
                { 
                  text: 'TURMA: ' + (cab.turma || '_______'), 
                  fontSize: 9, margin: [0, -5, 0, 5], 
                  border: [true, false, true, true] 
                }
              ],
              [
                {
                  colSpan: 2,
                  text: 'ASSINATURA:\n\n\n',
                  fontSize: 8
                },
                {}
              ]
            ]
          }
        }
      ]
    };
  }

  private buildInstructions(): Content {
    return {
      stack: [
        { text: 'INSTRUÇÕES DE PREENCHIMENTO', style: 'instructionTitle' },
        {
          columns: [
            {
              width: '70%',
              stack: [
                { text: '1. Utilize caneta esferográfica azul ou preta.', style: 'instructionText' },
                { text: '2. Preencha completamente a bolha correspondente à sua resposta.', style: 'instructionText' },
                { text: '3. Não rasure, não amasse e não dobre esta folha.', style: 'instructionText' }
              ]
            },
            {
              width: '30%',
              stack: [
                 {
                   canvas: [
                     { type: 'ellipse', x: 15, y: 5, r1: 5, r2: 5, color: '#000' },
                     { type: 'ellipse', x: 35, y: 5, r1: 5, r2: 5, lineColor: '#000' },
                     { type: 'ellipse', x: 55, y: 5, r1: 5, r2: 5, lineColor: '#000' },
                   ]
                 },
                 { text: '(A)   (B)   (C)', fontSize: 7, margin: [8, 2, 0, 0] }
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 15] }
      ]
    };
  }

  private buildAnswerGrid(totalGrade: number, totalReal: number): Content {
    const itemsPerCol = Math.ceil(totalGrade / 3);
    
    const col1 = this.createColumn(1, itemsPerCol, totalReal);
    const col2 = this.createColumn(itemsPerCol + 1, itemsPerCol * 2, totalReal);
    const col3 = this.createColumn((itemsPerCol * 2) + 1, totalGrade, totalReal);

    return {
      columns: [
        { stack: col1, width: '*' },
        { stack: col2, width: '*' },
        { stack: col3, width: '*' }
      ],
      columnGap: 20
    };
  }

  private createColumn(start: number, end: number, limit: number): any[] {
    const rows = [];

    rows.push({
      columns: [
        { text: '', width: 20 },
        { text: 'A      B      C      D      E', style: 'columnHeaderLetters', width: 'auto', margin: [7, 0, 0, 5] }
      ]
    });

    for (let i = start; i <= end; i++) {
      const isActive = i <= limit;
      const bubbleColor = isActive ? 'black' : '#e0e0e0';
      const textColor = isActive ? 'black' : '#ccc';

      rows.push({
        columns: [
          { text: i.toString().padStart(2, '0'), width: 20, style: 'questionNum', color: textColor },
          {
            width: 'auto',
            canvas: this.drawBubbles(bubbleColor)
          }
        ],
        margin: [0, 0, 0, 6]
      });
    }
    return rows;
  }

  private drawBubbles(color: string): any[] {
    const bubbles = [];
    const spacing = 16; 
    let x = 10;

    for (let j = 0; j < 5; j++) {
      bubbles.push({
        type: 'ellipse',
        x: x,
        y: 4,
        r1: 5, r2: 5,
        lineWidth: 0.8,
        lineColor: color
      });
      x += spacing;
    }
    return bubbles;
  }

  private buildFooter(): Content {
    return {
      text: 'Área reservada para leitura ótica - Não dobre nem amasse esta região.',
      style: 'footerText'
    };
  }
}