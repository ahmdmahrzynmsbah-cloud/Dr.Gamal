const fs = require('fs');

const file = 'src/components/ClassesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "  const loadData = () => {";
const replacementStr = `  const handleProcessAction = (text: string, onComplete: () => void) => {
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
  };

  const loadData = () => {`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content, 'utf8');
console.log("Added handleProcessAction.");
