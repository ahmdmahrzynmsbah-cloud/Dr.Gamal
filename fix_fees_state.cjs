const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const target = "  const [payments, setPayments] = useState<FeePayment[]>([]);";
const replace = `  const [payments, setPayments] = useState<FeePayment[]>([]);
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
content = content.replace(target, replace);
fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
