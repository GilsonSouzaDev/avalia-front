import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AvaliacaoDraft } from '../interfaces/Avaliacao';
import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';

@Injectable({
  providedIn: 'root',
})
export class CadernoProfessorGeneratorService {

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

  async generateTeacherKey(draft: AvaliacaoDraft): Promise<void> {
    const cab = draft.cabecalho || {};
    const questoes = draft.questoesSelecionadas || [];

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      info: {
        title: 'Gabarito Oficial',
        author: cab.professor || 'Professor',
      },
      content: [
        this.buildHeader(cab),
        this.buildSummary(questoes),
        { text: 'LISTA DE RESPOSTAS', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        this.buildDetailedTable(questoes),
        { text: 'GABARITO VISUAL (CORREÇÃO RÁPIDA)', style: 'sectionHeader', margin: [0, 30, 0, 10] },
        this.buildVisualGrid(questoes)
      ],
      styles: {
        title: { fontSize: 16, bold: true, alignment: 'center', color: '#2c3e50' },
        subtitle: { fontSize: 11, alignment: 'center', color: '#555', margin: [0, 2, 0, 20] },
        sectionHeader: { fontSize: 12, bold: true, color: '#3f51b5', decoration: 'underline' },
        tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#3f51b5', alignment: 'center' },
        tableRow: { fontSize: 10, color: '#333', alignment: 'center' },
        tableRowAlt: { fontSize: 10, color: '#333', alignment: 'center', fillColor: '#f5f5f5' }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  private buildHeader(cab: any): Content {
    return {
      stack: [
        { text: 'GABARITO DO PROFESSOR', style: 'title' },
        { text: `${cab.curso || 'Curso'} - ${cab.titulo || 'Avaliação'}`, style: 'subtitle' },
        {
            columns: [
                { text: `Professor: ${cab.professor}`, fontSize: 10 },
                { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, fontSize: 10, alignment: 'right' }
            ],
            margin: [0, 0, 0, 15]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#ccc' }] }
      ]
    };
  }

  private buildSummary(questoes: any[]): Content {
    const summary: Record<string, number> = {};
    questoes.forEach(q => {
        const disc = q.disciplina?.nome || 'Geral';
        summary[disc] = (summary[disc] || 0) + 1;
    });

    const body: TableCell[][] = [
        [ { text: 'Disciplina', style: 'tableHeader', alignment: 'left' }, { text: 'Qtd. Questões', style: 'tableHeader' } ]
    ];

    Object.keys(summary).forEach(key => {
        body.push([
            { text: key, style: 'tableRow', alignment: 'left' },
            { text: summary[key].toString(), style: 'tableRow' }
        ]);
    });

    return {
        table: {
            widths: ['*', 100],
            body: body
        },
        layout: 'lightHorizontalLines',
        margin: [0, 15, 0, 0]
    };
  }

  private buildDetailedTable(questoes: any[]): Content {
    const body: TableCell[][] = [];
    
    body.push([
      { text: '#', style: 'tableHeader' },
      { text: 'Resp.', style: 'tableHeader' },
      { text: 'Disciplina', style: 'tableHeader' },
      { text: 'Início do Enunciado', style: 'tableHeader' }
    ]);

    questoes.forEach((q, index) => {
      const indexCorreta = q.alternativas.findIndex((alt: any) => alt.correta);
      const letra = indexCorreta >= 0 ? String.fromCharCode(65 + indexCorreta) : '?';
      
      const style = index % 2 === 0 ? 'tableRow' : 'tableRowAlt';
      const cleanEnunciado = q.enunciado.replace(/\n/g, ' ').substring(0, 45) + '...';

      body.push([
        { text: (index + 1).toString(), style: style },
        { text: letra, style: style, bold: true },
        { text: q.disciplina?.nome || '-', style: style, alignment: 'left' },
        { text: cleanEnunciado, style: style, alignment: 'left', fontSize: 9 }
      ]);
    });

    return {
      table: {
        headerRows: 1,
        widths: [30, 40, 150, '*'],
        body: body
      },
      layout: 'noBorders'
    };
  }

  private buildVisualGrid(questoes: any[]): Content {
    const itemsPerCol = Math.ceil(questoes.length / 3);
    const col1 = this.createVisualColumn(questoes, 0, itemsPerCol);
    const col2 = this.createVisualColumn(questoes, itemsPerCol, itemsPerCol * 2);
    const col3 = this.createVisualColumn(questoes, itemsPerCol * 2, itemsPerCol * 3);

    return {
      columns: [
        { stack: col1, width: '*' },
        { stack: col2, width: '*' },
        { stack: col3, width: '*' }
      ],
      columnGap: 20
    };
  }

  private createVisualColumn(questoes: any[], start: number, end: number): any[] {
    const rows = [];

    rows.push({
      columns: [
        { text: '', width: 20 },
        { text: 'A     B     C     D     E', fontSize: 8, bold: true, width: 'auto', margin: [9, 0, 0, 5] }
      ]
    });

    for (let i = start; i < end; i++) {
        if (i >= questoes.length) break;

        const q = questoes[i];
        const indexCorreta = q.alternativas.findIndex((alt: any) => alt.correta);
        
        rows.push({
            columns: [
                { text: (i + 1).toString(), width: 20, fontSize: 9, bold: true, alignment: 'right' },
                { width: 'auto', canvas: this.drawVisualBubbles(indexCorreta) }
            ],
            margin: [0, 0, 0, 4]
        });
    }
    return rows;
  }

  private drawVisualBubbles(correctIndex: number): any[] {
    const bubbles = [];
    const spacing = 14; 
    let x = 10;
    
    for (let j = 0; j < 5; j++) {
      const isCorrect = j === correctIndex;
      bubbles.push({
        type: 'ellipse',
        x: x, y: 4, r1: 4, r2: 4,
        color: isCorrect ? 'black' : 'white', 
        lineColor: 'black',
        lineWidth: 0.5
      });
      x += spacing;
    }
    return bubbles;
  }
}