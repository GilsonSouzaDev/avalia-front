import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AvaliacaoDraft } from './avaliacao-state.service';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  constructor() {}

  /**
   * Gera o PDF da avaliação a partir do rascunho.
   * @param draft O rascunho da avaliação com todas as informações.
   */
  async generatePdf(draft: AvaliacaoDraft): Promise<void> {
    const doc = new jsPDF();
    let yOffset = 10;
    const lineHeight = 7;
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Título e Cabeçalho ---
    doc.setFontSize(18);
    doc.text(draft.cabecalho.titulo || 'Avaliação', pageWidth / 2, yOffset, {
      align: 'center',
    });
    yOffset += lineHeight * 2;

    doc.setFontSize(12);
    doc.text(`Disciplina: ${draft.disciplinaNome || 'Mista'}`, margin, yOffset);
    yOffset += lineHeight;
    doc.text(
      `Turma: ${draft.cabecalho.turma || 'Não Informada'}`,
      margin,
      yOffset
    );
    yOffset += lineHeight;
    const dataFormatada = draft.cabecalho.data
      ? new Date(draft.cabecalho.data).toLocaleDateString('pt-BR')
      : 'Não Informada';
    doc.text(`Data: ${dataFormatada}`, margin, yOffset);
    yOffset += lineHeight * 2;

    // --- Instruções ---
    doc.setFontSize(14);
    doc.text('Instruções:', margin, yOffset);
    yOffset += lineHeight;
    doc.setFontSize(10);
    doc.text(
      'Leia atentamente cada questão antes de responder.',
      margin,
      yOffset
    );
    yOffset += lineHeight * 2;

    // --- Questões ---
    doc.setFontSize(14);
    doc.text('Questões:', margin, yOffset);
    yOffset += lineHeight;

    draft.questoesSelecionadas.forEach((questao, index) => {
      doc.setFontSize(12);
      const questaoText = `${index + 1}. [${questao.disciplinaNome}] ${
        questao.enunciado
      }`;

      // Verifica se precisa de nova página
      if (
        yOffset + lineHeight * 3 >
        doc.internal.pageSize.getHeight() - margin
      ) {
        doc.addPage();
        yOffset = margin;
      }

      // Adiciona o texto da questão
      const splitText = doc.splitTextToSize(
        questaoText,
        pageWidth - margin * 2
      );
      doc.text(splitText, margin, yOffset);
      yOffset += splitText.length * lineHeight;

      // Adiciona um espaço para resposta (simulação)
      doc.text(
        '____________________________________________________________________________________________________',
        margin,
        yOffset
      );
      yOffset += lineHeight * 2;
    });

    // --- Rodapé ---
    doc.setFontSize(10);
    doc.text(
      'Assinatura do Professor: _________________________',
      margin,
      doc.internal.pageSize.getHeight() - margin
    );

    // Salva o PDF
    doc.save(
      `${draft.cabecalho.titulo || 'avaliacao'}_${dataFormatada.replace(
        /\//g,
        '-'
      )}.pdf`
    );
  }

  /**
   * Gera o PDF da avaliação a partir de um elemento HTML (abordagem alternativa).
   * Esta função é um exemplo e pode ser mais complexa de integrar no Angular.
   * @param elementId O ID do elemento HTML a ser capturado.
   */
  async generatePdfFromHtml(
    elementId: string,
    filename: string = 'avaliacao.pdf'
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Elemento com ID "${elementId}" não encontrado.`);
      return;
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  }
}
