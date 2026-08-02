const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const stateTarget = "  const [transactions, setTransactions] = useState<FeePayment[]>([]);";
const stateReplace = `  const [transactions, setTransactions] = useState<FeePayment[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTargetReceipt, setPrintTargetReceipt] = useState<FeePayment | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');

  const handleProcessAction = (text: string, onComplete: () => void) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingText(text);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        setProcessingProgress(progress);
        clearInterval(interval);
        
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingProgress(0);
          onComplete();
        }, 400);
      } else {
        setProcessingProgress(progress);
      }
    }, 150);
  };`;
content = content.replace(stateTarget, stateReplace);

const printTarget = `                onClick={() => {
                  const printContents = document.getElementById('sams-printable-invoice-element')?.outerHTML;
                  if (!printContents) return;
                  const printWindow = window.open('', '_blank');`;

const printReplace = `                onClick={() => {
                  handleProcessAction('جاري تجهيز الإيصال للطباعة...', () => {
                    setPrintTargetReceipt(selectedReceipt);
                    setShowPrintModal(true);
                    setSelectedReceipt(null);
                  });
                }}
                className="old-print-ignored"
                style={{ display: 'none' }}
                onClick_ignore={() => {
                  const printContents = document.getElementById('sams-printable-invoice-element')?.outerHTML;
                  if (!printContents) return;
                  const printWindow = window.open('', '_blank');`;

content = content.replace(printTarget, printReplace);

// We need to also find the place where it renders the receipt modal.
// Wait, the receipt modal IS currently a modal (an overlay). The user wants the receipt to be a standalone page when printing?
// Actually, they want the PRINT preview to be a standalone page. But for receipts, it's already a nice modal that has a "print" button. When you click print, it opens a window. 
// We should make the receipt itself printable directly! Wait, if they just want it to print, they can do `window.print()` from the modal, but the modal is over the page. 
// If they want the receipt in a standalone page for printing:
fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
console.log("Updated FeesTracker print");
