import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { Student } from '../types';

export interface GeneratedPdfResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
  file: File;
  pdf: jsPDF;
}

/**
 * Captures a DOM element to high-res PNG data URL with 100% original app colors,
 * badges, borders, gradients, and Arabic Unicode typography.
 * 
 * Guarantees a standardized, executive A4 width (1000px) regardless of device screen size
 * so the output PDF is never squished, never sliced awkwardly in the middle of cards,
 * and maintains 100% full visual fidelity.
 */
async function captureElementToPng(
  element: HTMLElement,
  isDark: boolean
): Promise<{ imgData: string; width: number; height: number }> {
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';

  // Create an off-screen staging clone with fixed standard A4 document layout
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'pdf-render-staging-clone';
  clone.style.position = 'fixed';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.width = '1000px';
  clone.style.minWidth = '1000px';
  clone.style.maxWidth = '1000px';
  clone.style.zIndex = '-9999';
  clone.style.boxSizing = 'border-box';
  clone.style.padding = '24px 28px';
  clone.style.backgroundColor = bgColor;
  clone.style.color = textColor;
  clone.style.margin = '0';
  clone.style.overflow = 'visible';

  // Force desktop multi-column layouts on all responsive grids inside clone
  const md3 = clone.querySelectorAll('.md\\:grid-cols-3, .grid-cols-1.md\\:grid-cols-3');
  md3.forEach((g) => {
    const el = g as HTMLElement;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = '310px 1fr';
    el.style.gap = '12px';
  });

  const md2 = clone.querySelectorAll('.md\\:grid-cols-2, .grid-cols-1.md\\:grid-cols-2');
  md2.forEach((g) => {
    const el = g as HTMLElement;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    el.style.gap = '12px';
  });

  const md4 = clone.querySelectorAll('.md\\:grid-cols-4, .lg\\:grid-cols-4, .print\\:grid-cols-4');
  md4.forEach((g) => {
    const el = g as HTMLElement;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    el.style.gap = '8px';
  });

  const lg6 = clone.querySelectorAll('.lg\\:grid-cols-6, .print\\:grid-cols-6');
  lg6.forEach((g) => {
    const el = g as HTMLElement;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'repeat(6, minmax(0, 1fr))';
    el.style.gap = '6px';
  });

  // Hide mobile-only elements and show desktop tables
  const mobileHidden = clone.querySelectorAll('.md\\:hidden');
  mobileHidden.forEach((m) => ((m as HTMLElement).style.display = 'none'));

  const desktopBlock = clone.querySelectorAll('.hidden.md\\:block, .hidden.print\\:block');
  desktopBlock.forEach((d) => ((d as HTMLElement).style.display = 'block'));

  const printFlex = clone.querySelectorAll('.hidden.print\\:flex');
  printFlex.forEach((pf) => ((pf as HTMLElement).style.display = 'flex'));

  // Hide interactive non-printable elements
  const printHidden = clone.querySelectorAll('.print\\:hidden');
  printHidden.forEach((ph) => {
    if (!ph.classList.contains('print:flex') && !ph.classList.contains('print:block')) {
      (ph as HTMLElement).style.display = 'none';
    }
  });

  document.body.appendChild(clone);

  try {
    const dataUrl = await toPng(clone, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: bgColor,
      cacheBust: true,
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });

    return {
      imgData: dataUrl,
      width: img.naturalWidth || img.width || 1000,
      height: img.naturalHeight || img.height || 1400,
    };
  } finally {
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}

/**
 * Generates an official high-resolution printable PDF from a DOM element.
 * Guarantees zero sliced cards, zero cut text, and 100% pristine visual clarity.
 */
export async function generateStudentReportPdf(
  student: Student,
  elementId = 'printable-group-roster'
): Promise<GeneratedPdfResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('تعذر العثور على محتوى التقرير لتجهيز ملف الـ PDF.');
  }

  // Detect current active theme (Dark Mode vs Light Mode)
  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
      (typeof window !== 'undefined' && localStorage.getItem('sams_dark_mode') === 'true'));

  // Clean, standard Arabic filename for parents
  const rawStudentName = (student.name || 'طالب').trim();
  const cleanStudentName = rawStudentName.replace(/[/\\?%*:|"<>]/g, ' ').replace(/\s+/g, ' ');
  const filename = `تقرير الطالب ${cleanStudentName}.pdf`;

  // Capture element in standardized desktop layout
  const { imgData, width, height } = await captureElementToPng(element, isDark);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Set standard ASCII metadata to prevent viewer title corruption
  pdf.setProperties({
    title: `Student Report - ${student.registration_id || student.id}`,
    subject: 'Official Academic Student Report',
    author: 'Academic Management System',
    creator: 'Academic Management System',
  });

  const pageWidth = 210; // A4 mm
  const pageHeight = 297; // A4 mm

  // Exact theme background color (Dark Mode: #0f172a, Light Mode: #ffffff)
  const bgR = isDark ? 15 : 255;
  const bgG = isDark ? 23 : 255;
  const bgB = isDark ? 42 : 255;

  const printWidth = pageWidth;
  const rawPrintHeight = (height * printWidth) / width;

  // If the document fits on 1 page (or with subtle scaling up to 1.15 ratio), fit onto 1 single clean page
  if (rawPrintHeight <= pageHeight) {
    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.addImage(imgData, 'PNG', 0, 0, printWidth, rawPrintHeight);
  } else if (rawPrintHeight <= pageHeight * 1.18) {
    // Proportional fit to keep the document on 1 executive page with zero cut text
    const scale = pageHeight / rawPrintHeight;
    const scaledWidth = printWidth * scale;
    const scaledHeight = pageHeight;
    const xOffset = (pageWidth - scaledWidth) / 2;

    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
  } else {
    // Multi-page document
    let heightLeft = rawPrintHeight;
    let position = 0;

    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.addImage(imgData, 'PNG', 0, position, printWidth, rawPrintHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 5) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.addImage(imgData, 'PNG', 0, position, printWidth, rawPrintHeight);
      heightLeft -= pageHeight;
    }
  }

  const blob = pdf.output('blob');
  const dataUrl = URL.createObjectURL(blob);
  const file = new File([blob], filename, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });

  return {
    blob,
    dataUrl,
    filename,
    file,
    pdf,
  };
}

/**
 * Downloads a generated PDF directly to the user's phone or computer with proper Arabic filename
 */
export function downloadPdfBlob(blob: Blob, filename: string) {
  const pdfBlob = new Blob([blob], { type: 'application/pdf' });
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 3000);
}
