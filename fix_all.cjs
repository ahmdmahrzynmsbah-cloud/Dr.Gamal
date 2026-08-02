const fs = require('fs');

// Fix Exams
let exams = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');
const examLucideMatch = exams.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
if (examLucideMatch) {
  let imports = examLucideMatch[1];
  if (!imports.includes('RefreshCw')) imports += ', RefreshCw';
  exams = exams.replace(examLucideMatch[0], "import { " + imports + " } from 'lucide-react'");
}
fs.writeFileSync('src/components/ExamsAndAssignments.tsx', exams, 'utf8');

// Fix FeesTracker
let fees = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');
const feeStateTarget = "  const [transactions, setTransactions] = useState<FeePayment[]>([]);";
if (fees.includes(feeStateTarget)) {
  const feeStateReplace = `  const [transactions, setTransactions] = useState<FeePayment[]>([]);
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
  fees = fees.replace(feeStateTarget, feeStateReplace);
}

// Fix duplicate onClick in FeesTracker
// I should just find className="old-print-ignored" and remove it and the old onClick
fees = fees.replace(/className="old-print-ignored"\s*style=\{\{ display: 'none' \}\}\s*onClick_ignore=\{[^\}]+\}/g, '');
fees = fees.replace(/onClick_ignore=\{\(\) => \{[^}]+\}\}/g, '');

const doubleOnClickRegex = /onClick=\{\(\) => \{\s*const printContents = document\.getElementById[^}]+\}\}/g;
fees = fees.replace(doubleOnClickRegex, '');

fs.writeFileSync('src/components/FeesTracker.tsx', fees, 'utf8');

