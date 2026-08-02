const fs = require('fs');
let content = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');

// Add states
const stateTarget = "  const [isEditingSheet, setIsEditingSheet] = useState(false);";
const stateReplace = `  const [isEditingSheet, setIsEditingSheet] = useState(false);
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

// We need to extract the logic that computes the stats for rendering so it can be reused in the React render
// But we can just compute it directly inside the render if showPrintModal is true.

fs.writeFileSync('src/components/ExamsAndAssignments.tsx', content, 'utf8');
console.log("Added states");
