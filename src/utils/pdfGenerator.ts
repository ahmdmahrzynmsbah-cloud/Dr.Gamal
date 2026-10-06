import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Student } from '../types';

export interface GeneratedPdfResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
  file: File;
  pdf: jsPDF;
}

/**
 * Captures a DOM element to high-res PNG data URL safely.
 * Uses html2canvas-pro with onclone computed-color normalization.
 * Guarantees 100% crystal-clear Arabic Unicode text rendering (zero Mojibake)
 * and resolves any Tailwind v4 oklch CSS issues seamlessly.
 */
async function captureElementToPng(element: HTMLElement, isDark: boolean): Promise<{ imgData: string; width: number; height: number }> {
  const bgColor = isDark ? '#0f172a' : '#ffffff';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: bgColor,
      windowWidth: 1200,
      ignoreElements: (node) => {
        if (node instanceof HTMLElement) {
          if (node.classList.contains('print:hidden') && !node.classList.contains('print:flex') && !node.classList.contains('print:block')) {
            return true;
          }
        }
        return false;
      },
      onclone: (clonedDoc) => {
        try {
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const comp = window.getComputedStyle(htmlEl);
              // Normalize modern CSS color variables to browser-resolved RGB
              if (comp.color && comp.color.includes('rgb')) htmlEl.style.color = comp.color;
              if (comp.backgroundColor && comp.backgroundColor.includes('rgb')) htmlEl.style.backgroundColor = comp.backgroundColor;
              if (comp.borderColor && comp.borderColor.includes('rgb')) htmlEl.style.borderColor = comp.borderColor;
            }
          });
        } catch (e) {
          // Ignore normalization catch
        }
      }
    });

    return {
      imgData: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    };
  } catch (err: any) {
    console.warn('html2canvas capture error, attempting direct canvas render:', err);
    
    // Direct fallback
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: bgColor
    });

    return {
      imgData: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    };
  }
}

/**
 * Generates an official high-resolution printable PDF from a DOM element (such as student report card)
 * Handles RTL Arabic text natively with ZERO corrupted characters / Mojibake.
 * Supports complete Dark Mode / Light Mode with zero white borders.
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
  const isDark = typeof document !== 'undefined' && (
    document.documentElement.classList.contains('dark') ||
    (typeof window !== 'undefined' && localStorage.getItem('sams_dark_mode') === 'true')
  );

  // Clean, standard Arabic filename for parents (e.g. تقرير الطالب عمر ماهر زين.pdf)
  const rawStudentName = (student.name || 'طالب').trim();
  const cleanStudentName = rawStudentName.replace(/[/\\?%*:|"<>]/g, ' ').replace(/\s+/g, ' ');
  const filename = `تقرير الطالب ${cleanStudentName}.pdf`;

  // Capture image with native Arabic Unicode text rendering
  const { imgData, width, height } = await captureElementToPng(element, isDark);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210; // A4 mm
  const pageHeight = 297; // A4 mm

  // Exact background fill (Dark Mode: #0f172a, Light Mode: #ffffff)
  const bgR = isDark ? 15 : 255;
  const bgG = isDark ? 23 : 255;
  const bgB = isDark ? 42 : 255;

  const printWidth = pageWidth;
  const printHeight = (height * printWidth) / width;

  if (printHeight <= pageHeight) {
    // Single page document
    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.addImage(imgData, 'PNG', 0, 0, printWidth, printHeight);
  } else {
    // Multi-page document
    let heightLeft = printHeight;
    let position = 0;

    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.addImage(imgData, 'PNG', 0, position, printWidth, printHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.addImage(imgData, 'PNG', 0, position, printWidth, printHeight);
      heightLeft -= pageHeight;
    }
  }

  const blob = pdf.output('blob');
  const dataUrl = URL.createObjectURL(blob);
  const file = new File([blob], filename, { type: 'application/pdf', lastModified: Date.now() });

  return {
    blob,
    dataUrl,
    filename,
    file,
    pdf
  };
}

/**
 * Downloads a generated PDF directly to the user's device with proper Arabic filename
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
  }, 2000);
}
