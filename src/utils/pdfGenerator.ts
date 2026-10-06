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
 * Works seamlessly across Mobile phones (iOS / Android) and Desktop browsers.
 * Clones the element into a standardized A4 document viewport (1100px width)
 * so the output PDF is always an official, crisp, multi-column report card.
 */
async function captureElementToPng(
  element: HTMLElement,
  isDark: boolean
): Promise<{ imgData: string; width: number; height: number }> {
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const borderColor = isDark ? '#334155' : '#cbd5e1';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: bgColor,
      windowWidth: 1200,
      ignoreElements: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains('print:hidden') &&
            !node.classList.contains('print:flex') &&
            !node.classList.contains('print:block')
          ) {
            return true;
          }
        }
        return false;
      },
      onclone: (clonedDoc) => {
        try {
          const targetEl =
            clonedDoc.getElementById(element.id) ||
            (clonedDoc.querySelector(`#${element.id}`) as HTMLElement);

          if (targetEl) {
            // Standardize report container to fixed executive A4 layout width
            targetEl.style.width = '1080px';
            targetEl.style.minWidth = '1080px';
            targetEl.style.maxWidth = '1080px';
            targetEl.style.boxSizing = 'border-box';
            targetEl.style.margin = '0 auto';
            targetEl.style.padding = '32px';
            targetEl.style.backgroundColor = bgColor;
            targetEl.style.color = textColor;

            // Ensure desktop table is visible and mobile card list is hidden
            const mobileCards = targetEl.querySelectorAll('.block.md\\:hidden, .md\\:hidden');
            mobileCards.forEach((m) => {
              (m as HTMLElement).style.setProperty('display', 'none', 'important');
            });

            const desktopTables = targetEl.querySelectorAll(
              '.hidden.md\\:block, .hidden.print\\:block, .md\\:block'
            );
            desktopTables.forEach((d) => {
              (d as HTMLElement).style.setProperty('display', 'block', 'important');
            });

            const printFlexes = targetEl.querySelectorAll('.hidden.print\\:flex');
            printFlexes.forEach((pf) => {
              (pf as HTMLElement).style.setProperty('display', 'flex', 'important');
            });

            // Standardize Grids for multi-column layout on both mobile and desktop
            const allGrids = targetEl.querySelectorAll('.grid');
            allGrids.forEach((g) => {
              const gridEl = g as HTMLElement;
              if (
                gridEl.classList.contains('md:grid-cols-3') ||
                gridEl.classList.contains('sm:grid-cols-3')
              ) {
                gridEl.style.display = 'grid';
                gridEl.style.gridTemplateColumns = '320px 1fr';
                gridEl.style.gap = '14px';
              } else if (
                gridEl.classList.contains('md:grid-cols-2') ||
                gridEl.classList.contains('sm:grid-cols-2')
              ) {
                gridEl.style.display = 'grid';
                gridEl.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
                gridEl.style.gap = '14px';
              } else if (gridEl.classList.contains('lg:grid-cols-6')) {
                gridEl.style.display = 'grid';
                gridEl.style.gridTemplateColumns = 'repeat(6, minmax(0, 1fr))';
                gridEl.style.gap = '8px';
              }
            });

            // Normalize computed colors to protect against Tailwind oklch parsing
            const allChildren = targetEl.querySelectorAll('*');
            allChildren.forEach((child) => {
              const htmlChild = child as HTMLElement;
              if (htmlChild.style) {
                const comp = window.getComputedStyle(htmlChild);
                if (comp.color && comp.color.includes('rgb')) {
                  htmlChild.style.color = comp.color;
                }
                if (comp.backgroundColor && comp.backgroundColor.includes('rgb')) {
                  htmlChild.style.backgroundColor = comp.backgroundColor;
                }
                if (comp.borderColor && comp.borderColor.includes('rgb')) {
                  htmlChild.style.borderColor = comp.borderColor;
                }
              }
            });
          }
        } catch (cloneErr) {
          console.warn('onclone formatting error:', cloneErr);
        }
      },
    });

    return {
      imgData: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err: any) {
    console.warn('html2canvas primary capture failed, falling back to direct render:', err);
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: bgColor,
    });

    return {
      imgData: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    };
  }
}

/**
 * Generates an official high-resolution printable PDF from a DOM element.
 * Works with 100% Arabic Unicode text fidelity on mobile phones and desktop.
 * Supports full Dark Mode / Light Mode with zero white margins.
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

  // Capture element to high-res image
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
    subject: 'Academic Student Report',
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
    // Single page document - fill full background and render image
    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.addImage(imgData, 'PNG', 0, 0, printWidth, printHeight);
  } else {
    // Multi-page document with zero white margins
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
