import { jsPDF } from 'jspdf';
import { Deliverable, DeliverablePiece, DeliverablePage } from '../types';

interface PdfExportOptions {
  author?: string;
  offerTitle?: string;
}

function hexToRgb(hexString?: string): [number, number, number] {
  if (!hexString) return [37, 99, 235]; // Default vibrant blue
  let hex = hexString.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  if (isNaN(num) || hex.length !== 6) return [37, 99, 235];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'entregavel';
}

/**
 * Generates and downloads a formatted, publication-ready PDF for a Deliverable.
 */
export async function exportDeliverableToPdf(
  deliverable: Deliverable,
  options: PdfExportOptions = {}
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const usableWidth = pageWidth - marginX * 2;
  const accentRgb = hexToRgb(deliverable.design?.accentColor || '#2563eb');
  const lightBgRgb: [number, number, number] = [248, 250, 252];
  const cardBorderRgb: [number, number, number] = [226, 232, 240];
  const primaryTextRgb: [number, number, number] = [15, 23, 42];
  const mutedTextRgb: [number, number, number] = [100, 116, 139];

  const pieces: DeliverablePiece[] = (deliverable.pieces && deliverable.pieces.length > 0)
    ? deliverable.pieces
    : [
        {
          id: 'piece-default',
          category: 'main',
          title: deliverable.title,
          badge: 'Produto Principal',
          pagesCount: deliverable.chapters?.length || 1,
          status: 'ready',
          pages: (deliverable.chapters || []).map((ch, idx) => ({
            pageNumber: idx + 1,
            title: ch.title,
            subtitle: `Módulo didático oficial`,
            content: ch.content,
            callouts: ch.checklist
          }))
        }
      ];

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  // Top decorative band
  doc.setFillColor(...accentRgb);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Decorative subtle side stripe
  doc.setFillColor(...accentRgb);
  doc.rect(0, 0, 4, pageHeight, 'F');

  let y = 30;

  // Header Badge (Format pill)
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...cardBorderRgb);
  doc.roundedRect(marginX, y, 78, 8, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...accentRgb);
  const badgeText = (deliverable.format || 'MATERIAL DIDÁTICO DIGITAL').toUpperCase();
  doc.text(badgeText.slice(0, 36), marginX + 4, y + 5.5);

  y += 22;

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryTextRgb);
  const titleLines = doc.splitTextToSize(deliverable.title, usableWidth);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 9 + 4;

  // Subtitle / Proposition
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...mutedTextRgb);
  const subText = options.offerTitle
    ? `Desenvolvido para a oferta: ${options.offerTitle}`
    : 'Material estruturado para estudo, execução e aplicação prática direta.';
  const subLines = doc.splitTextToSize(subText, usableWidth);
  doc.text(subLines, marginX, y);
  y += subLines.length * 6 + 12;

  // Accent divider line
  doc.setDrawColor(...accentRgb);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, marginX + 40, y);
  doc.setDrawColor(...cardBorderRgb);
  doc.setLineWidth(0.2);
  doc.line(marginX + 40, y, marginX + usableWidth, y);
  y += 18;

  // Metadata Card Grid
  const cardHeight = 44;
  doc.setFillColor(...lightBgRgb);
  doc.setDrawColor(...cardBorderRgb);
  doc.roundedRect(marginX, y, usableWidth, cardHeight, 4, 4, 'FD');

  const colWidth = usableWidth / 3;
  const col1X = marginX + 6;
  const col2X = marginX + colWidth + 4;
  const col3X = marginX + colWidth * 2 + 4;
  const metaY = y + 10;

  // Col 1: Formato
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextRgb);
  doc.text('FORMATO OFICIAL', col1X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryTextRgb);
  doc.text('PDF A4 Imprimível', col1X, metaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextRgb);
  doc.text('Visualização & Impressão', col1X, metaY + 13);

  // Col 2: Total de Peças & Páginas
  const totalPagesSum = pieces.reduce((acc, p) => acc + (p.pages?.length || p.pagesCount || 0), 0);
  doc.text('ESTRUTURA', col2X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryTextRgb);
  doc.text(`${pieces.length} ${pieces.length === 1 ? 'Peça' : 'Peças'} Inclusas`, col2X, metaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextRgb);
  doc.text(`${totalPagesSum || deliverable.totalPages || 8} páginas no total`, col2X, metaY + 13);

  // Col 3: Status de Validação
  doc.text('STATUS', col3X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52); // green-800
  doc.text('Pronto para Uso', col3X, metaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextRgb);
  doc.text('Edição 100% Validada', col3X, metaY + 13);

  y += cardHeight + 20;

  // Peças inclusas no kit preview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryTextRgb);
  doc.text('Conteúdo Incluso neste Pacote:', marginX, y);
  y += 7;

  pieces.forEach((piece, index) => {
    if (y > pageHeight - 45) return;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...cardBorderRgb);
    doc.roundedRect(marginX, y, usableWidth, 12, 2.5, 2.5, 'FD');

    // Accent bullet / index
    doc.setFillColor(...accentRgb);
    doc.circle(marginX + 6, y + 6, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(String(index + 1), marginX + 4.8, y + 7.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryTextRgb);
    const pieceBadge = piece.badge ? `[${piece.badge}] ` : '';
    const pieceTitle = `${pieceBadge}${piece.title}`;
    doc.text(doc.splitTextToSize(pieceTitle, usableWidth - 35)[0], marginX + 12, y + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedTextRgb);
    const pCount = piece.pages?.length || piece.pagesCount || 1;
    doc.text(`${pCount} pág.`, marginX + usableWidth - 18, y + 7.5);

    y += 15;
  });

  // Cover Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextRgb);
  const footerText = 'Documento oficial estruturado no Veltor Workspace • Uso pessoal e instrutivo.';
  doc.text(footerText, marginX, pageHeight - 16);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, marginX + usableWidth - 30, pageHeight - 16);

  // ==========================================
  // PAGE 2+: CONTENT PAGES
  // ==========================================
  for (const piece of pieces) {
    const rawPages = piece.pages && piece.pages.length > 0
      ? piece.pages
      : [
          {
            pageNumber: 1,
            title: piece.title,
            subtitle: 'Orientações práticas e roteiro passo a passo',
            content: `Bem-vindo ao ${piece.title}. Siga as instruções abaixo para aplicar as orientações deste material didático com precisão e eficiência.\n\n1. Prepare os recursos necessários antes de iniciar;\n2. Execute as etapas na sequência recomendada;\n3. Revise cada ponto e aplique no seu dia a dia.`
          }
        ];

    for (let pIndex = 0; pIndex < rawPages.length; pIndex++) {
      const page = rawPages[pIndex];
      doc.addPage();

      // Top running bar
      doc.setFillColor(...accentRgb);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Running Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedTextRgb);
      const categoryTag = (piece.badge || piece.category).toUpperCase();
      doc.text(`${categoryTag} • ${deliverable.title.slice(0, 40)}`, marginX, 12);
      doc.text(piece.title.slice(0, 35), marginX + usableWidth - doc.getTextWidth(piece.title.slice(0, 35)), 12);

      doc.setDrawColor(...cardBorderRgb);
      doc.setLineWidth(0.3);
      doc.line(marginX, 15, marginX + usableWidth, 15);

      let currentY = 25;

      // Page Number Indicator Badge
      doc.setFillColor(...accentRgb);
      doc.roundedRect(marginX, currentY, 24, 6, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`PÁGINA ${page.pageNumber || pIndex + 1}`, marginX + 3, currentY + 4.2);

      if (page.visualType) {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(...cardBorderRgb);
        doc.roundedRect(marginX + 27, currentY, 40, 6, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...mutedTextRgb);
        doc.text(page.visualType.toUpperCase(), marginX + 30, currentY + 4.2);
      }

      currentY += 12;

      // Page Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...primaryTextRgb);
      const pageTitleLines = doc.splitTextToSize(page.title || `Módulo ${pIndex + 1}`, usableWidth);
      doc.text(pageTitleLines, marginX, currentY);
      currentY += pageTitleLines.length * 6.5 + 2;

      // Page Subtitle
      if (page.subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(...mutedTextRgb);
        const pageSubLines = doc.splitTextToSize(page.subtitle, usableWidth);
        doc.text(pageSubLines, marginX, currentY);
        currentY += pageSubLines.length * 4.8 + 4;
      }

      // Decorative divider
      doc.setDrawColor(...cardBorderRgb);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY, marginX + usableWidth, currentY);
      currentY += 8;

      // Callouts / Destaques
      if (page.callouts && Array.isArray(page.callouts) && page.callouts.length > 0) {
        page.callouts.forEach(callout => {
          if (!callout || typeof callout !== 'string') return;
          const calloutLines = doc.splitTextToSize(callout.trim(), usableWidth - 14);
          const boxHeight = calloutLines.length * 4.5 + 8;

          if (currentY + boxHeight > pageHeight - 25) {
            doc.addPage();
            currentY = 25;
          }

          doc.setFillColor(...lightBgRgb);
          doc.setDrawColor(...cardBorderRgb);
          doc.roundedRect(marginX, currentY, usableWidth, boxHeight, 3, 3, 'FD');

          // Accent Left Indicator Strip
          doc.setFillColor(...accentRgb);
          doc.roundedRect(marginX, currentY, 2.5, boxHeight, 1.2, 1.2, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...accentRgb);
          doc.text('DESTAQUE / PONTO CHAVE:', marginX + 6, currentY + 5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...primaryTextRgb);
          doc.text(calloutLines, marginX + 6, currentY + 9.5);

          currentY += boxHeight + 5;
        });
      }

      // Content Body
      const contentRaw = page.content || '';
      const paragraphs = contentRaw.split(/\n+/).filter(p => p.trim());

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...primaryTextRgb);

      for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        const isBullet = /^[-*•]\s+/.test(trimmed) || /^\[[ xX✓]\]\s+/.test(trimmed);
        const isNumbered = /^\d+[\.\)]\s+/.test(trimmed);
        const isChecklist = /^\[[ xX✓]\]\s+/.test(trimmed);

        const cleanText = trimmed
          .replace(/^[-*•]\s+/, '')
          .replace(/^\d+[\.\)]\s+/, '')
          .replace(/^\[[ xX✓]\]\s+/, '');

        const indentX = (isBullet || isNumbered) ? marginX + 6 : marginX;
        const textWidth = (isBullet || isNumbered) ? usableWidth - 6 : usableWidth;
        const lines = doc.splitTextToSize(cleanText, textWidth);
        const paraHeight = lines.length * 5.2 + 3;

        // Overflow check: If paragraph exceeds page, add a new page
        if (currentY + paraHeight > pageHeight - 25) {
          doc.addPage();
          // Header on continued page
          doc.setFillColor(...accentRgb);
          doc.rect(0, 0, pageWidth, 4, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...mutedTextRgb);
          doc.text(`${page.title.slice(0, 45)} (Continuação)`, marginX, 12);
          doc.line(marginX, 15, marginX + usableWidth, 15);
          currentY = 24;
        }

        if (isChecklist) {
          // Draw neat checkbox icon
          doc.setDrawColor(...accentRgb);
          doc.setLineWidth(0.4);
          doc.roundedRect(marginX, currentY - 0.5, 3.5, 3.5, 0.8, 0.8, 'D');
        } else if (isBullet) {
          doc.setFillColor(...accentRgb);
          doc.circle(marginX + 1.5, currentY + 1.2, 1, 'F');
        } else if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)[\.\)]/);
          const numStr = numMatch ? numMatch[1] : '•';
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(...accentRgb);
          doc.text(`${numStr}.`, marginX, currentY + 1.2);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...primaryTextRgb);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...primaryTextRgb);
        doc.text(lines, indentX, currentY + 1.5);

        currentY += paraHeight;
      }
    }
  }

  // ==========================================
  // RUNNING FOOTERS ON ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(...cardBorderRgb);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, marginX + usableWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedTextRgb);
    doc.text(deliverable.title.slice(0, 50), marginX, pageHeight - 7.5);

    const pageCountText = `Página ${i} de ${totalPages}`;
    const countWidth = doc.getTextWidth(pageCountText);
    doc.text(pageCountText, marginX + usableWidth - countWidth, pageHeight - 7.5);
  }

  // Trigger browser download
  const filename = `${sanitizeFilename(deliverable.title)}.pdf`;
  doc.save(filename);
}

/**
 * Exports an individual piece of a deliverable as an isolated formatted PDF.
 */
export async function exportDeliverablePieceToPdf(
  deliverable: Deliverable,
  piece: DeliverablePiece
): Promise<void> {
  const isolatedDeliverable: Deliverable = {
    ...deliverable,
    title: `${deliverable.title} - ${piece.title}`,
    pieces: [piece],
    totalPages: piece.pages?.length || piece.pagesCount || 1
  };
  return exportDeliverableToPdf(isolatedDeliverable);
}
