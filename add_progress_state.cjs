const fs = require('fs');

const file = 'src/components/ClassesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "  const [archivedSearchTerm, setArchivedSearchTerm] = useState('');";
const replacementStr = `  const [archivedSearchTerm, setArchivedSearchTerm] = useState('');
  
  // Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content, 'utf8');
console.log("Added progress state.");
