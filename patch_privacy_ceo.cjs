const fs = require('fs');
let content = fs.readFileSync('src/components/PrivacyPolicy.tsx', 'utf8');

// Swap Anas from CEO to CTO
content = content.replace(/SECURE SEC-CEO/g, 'SECURE SEC-TEMP');
content = content.replace(/Co-Founder & CEO/g, 'Co-Founder & TEMP');

// Swap Ahmed to CEO
content = content.replace(/SECURE SEC-CTO/g, 'SECURE SEC-CEO');
content = content.replace(/Co-Founder & CTO/g, 'Co-Founder & CEO');

// Swap Anas to CTO
content = content.replace(/SECURE SEC-TEMP/g, 'SECURE SEC-CTO');
content = content.replace(/Co-Founder & TEMP/g, 'Co-Founder & CTO');

fs.writeFileSync('src/components/PrivacyPolicy.tsx', content, 'utf8');
