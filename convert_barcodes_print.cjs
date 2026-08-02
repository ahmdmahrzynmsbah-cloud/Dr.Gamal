const fs = require('fs');
let content = fs.readFileSync('src/components/StudentBarcodes.tsx', 'utf8');

const stateTarget = "  const [students, setStudents] = useState<Student[]>([]);";
const stateReplace = `  const [students, setStudents] = useState<Student[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTargetStudents, setPrintTargetStudents] = useState<Student[]>([]);
  
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

fs.writeFileSync('src/components/StudentBarcodes.tsx', content, 'utf8');
console.log("Added states to Barcodes");
