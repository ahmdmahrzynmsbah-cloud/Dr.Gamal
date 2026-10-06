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
 * Uses browser-native SVG foreignObject rendering via html-to-image.
 */
async function captureElementToPng(
  element: HTMLElement,
  isDark: boolean
): Promise<{ imgData: string; width: number; height: number }> {
  const bgColor = isDark ? '#0f172a' : '#ffffff';

  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: bgColor,
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains('print:hidden') &&
            !node.classList.contains('print:flex') &&
            !node.classList.contains('print:block')
          ) {
            return false;
          }
        }
        return true;
      },
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });

    return {
      imgData: dataUrl,
      width: img.naturalWidth || img.width || 1200,
      height: img.naturalHeight || img.height || 1600,
    };
  } catch (err: any) {
    console.warn('html-to-image primary capture issue, retrying with relaxed options:', err);
    
    // Retry with relaxed options
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 1.5,
      backgroundColor: bgColor,
    });

    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });

    return {
      imgData: dataUrl,
      width: img.naturalWidth || 1200,
      height: img.naturalHeight || 1600,
    };
  }
}

/**
 * Generates an official high-resolution printable PDF from a DOM element.
 * Preserves 100% of vibrant app colors, badges, and styling in both Light and Dark modes.
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

  // Capture high-res element snapshot with complete colors
  const { imgData, width, height } = await captureElementToPng(element, isDark);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Set standard ASCII metadata to avoid viewer title bar corruption
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
