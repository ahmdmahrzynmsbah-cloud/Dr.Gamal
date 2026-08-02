const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

const target = `@media print {
  body {
    background-color: white !important;
    color: black !important;
  }

  @page {
    margin: 0.5cm;
  }

  body * {
    visibility: hidden;
  }

  #printable-group-roster,
  #printable-group-roster *,
  #printable-attendance-sheet,
  #printable-attendance-sheet * {
    visibility: visible !important;
  }

  #printable-group-roster,
  #printable-attendance-sheet {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    background: white !important;
    color: black !important;
  }
  
  .no-print {
    display: none !important;
  }
}`;

const replacement = `@media print {
  body {
    background-color: white !important;
    color: black !important;
  }

  @page {
    margin: 0.5cm;
  }

  .no-print {
    display: none !important;
  }
  
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/index.css', content, 'utf8');
    console.log("Patched index.css final");
} else {
    console.log("Target not found in index.css");
}
