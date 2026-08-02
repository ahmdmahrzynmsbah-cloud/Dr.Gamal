const fs = require('fs');
let content = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

if (!content.includes('window.scrollTo')) {
  const target = `  useSamsDbSync(() => {
    loadData();
  });`;
  
  const replace = `  useSamsDbSync(() => {
    loadData();
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);`;
  
  if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync('src/components/StudentFullReport.tsx', content, 'utf8');
  }
}
