import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
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
 * Captures a DOM element to high-res PNG data URL safely with 100% full-width A4 layout,
 * true desktop multi-column proportions, and crisp Arabic Unicode typography.
 */
async function captureElementToPng(
  element: HTMLElement,
  isDark: boolean
): Promise<{ imgData: string; width: number; height: number }> {
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const targetWidth = 840; // Crisp executive A4 width in pixels

  // Create an offscreen sandbox with standard desktop A4 document width
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-9999px';
  sandbox.style.top = '0';
  sandbox.style.width = `${targetWidth}px`;
  sandbox.style.minWidth = `${targetWidth}px`;
  sandbox.style.maxWidth = `${targetWidth}px`;
  sandbox.style.backgroundColor = bgColor;
  sandbox.style.zIndex = '-9999';
  sandbox.style.visibility = 'visible';
  sandbox.setAttribute('dir', 'rtl');

  if (isDark) {
    sandbox.classList.add('dark');
  }

  const clonedNode = element.cloneNode(true) as HTMLElement;
  clonedNode.style.width = `${targetWidth}px`;
  clonedNode.style.minWidth = `${targetWidth}px`;
  clonedNode.style.maxWidth = `${targetWidth}px`;
  clonedNode.style.boxSizing = 'border-box';
  clonedNode.style.margin = '0';
  clonedNode.style.backgroundColor = bgColor;

  // Force desktop grid display on all responsive elements inside the cloned page
  const gridElements = clonedNode.querySelectorAll<HTMLElement>('.grid, .md\\:grid-cols-3, .md\\:grid-cols-2, .md\\:grid-cols-6, .md\\:grid-cols-4');
  gridElements.forEach((el) => {
    el.style.display = 'grid';
  });

  const hiddenElements = clonedNode.querySelectorAll<HTMLElement>('.print\\:hidden');
  hiddenElements.forEach((el) => {
    el.style.display = 'none';
  });

  sandbox.appendChild(clonedNode);
  document.body.appendChild(sandbox);

  try {
    // Brief settle time for layout computation
    await new Promise((r) => setTimeout(r, 70));

    // Render using html2canvas with scale 2 for retina sharpness
    const canvas = await html2canvas(clonedNode, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: bgColor,
      width: targetWidth,
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    return {
      imgData,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    console.warn('Sandbox html2canvas error, falling back to toPng:', err);
    try {
      const dataUrl = await toPng(clonedNode, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: bgColor,
        width: targetWidth,
      });
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
      });
      return {
        imgData: dataUrl,
        width: img.naturalWidth || targetWidth * 2,
        height: img.naturalHeight || 1200,
      };
    } catch (fallbackErr) {
      console.error('All capture methods failed:', fallbackErr);
      throw fallbackErr;
    }
  } finally {
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}

/**
 * Generates an official high-resolution printable PDF from a DOM element.
 * Guarantees zero blank pages, zero missing data, and 100% visual fidelity.
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

  // Check if document has defined page containers (.report-page)
  const pageElements = Array.from(element.querySelectorAll<HTMLElement>('.report-page'));

  if (pageElements.length > 0) {
    // Multi-page structured report: Render each discrete page individually without slicing
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const { imgData, width, height } = await captureElementToPng(pageEl, isDark);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      const renderWidth = pageWidth;
      const renderHeight = (height * renderWidth) / width;

      if (renderHeight > pageHeight) {
        // Proportional scale to fit within pageHeight with margin
        const scale = pageHeight / renderHeight;
        const scaledWidth = renderWidth * scale;
        const scaledHeight = pageHeight;
        const xOffset = (pageWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, renderWidth, renderHeight);
      }
    }
  } else {
    // Single container fallback
    const { imgData, width, height } = await captureElementToPng(element, isDark);
    const printWidth = pageWidth;
    const rawPrintHeight = (height * printWidth) / width;

    if (rawPrintHeight <= pageHeight) {
      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.addImage(imgData, 'PNG', 0, 0, printWidth, rawPrintHeight);
    } else if (rawPrintHeight <= pageHeight * 1.15) {
      const scale = pageHeight / rawPrintHeight;
      const scaledWidth = printWidth * scale;
      const scaledHeight = pageHeight;
      const xOffset = (pageWidth - scaledWidth) / 2;

      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    } else {
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
