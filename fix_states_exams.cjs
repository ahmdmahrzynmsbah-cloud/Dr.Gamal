const fs = require('fs');
let content = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');

const stateTarget = "  const [isEditingSheet, setIsEditingSheet] = useState<boolean>(false);";
const stateReplace = `  const [isEditingSheet, setIsEditingSheet] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
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

// Also we need to import RefreshCw
if (!content.includes('RefreshCw')) {
  content = content.replace('X,', 'X, RefreshCw,');
}

fs.writeFileSync('src/components/ExamsAndAssignments.tsx', content, 'utf8');
