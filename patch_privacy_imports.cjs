const fs = require('fs');
let content = fs.readFileSync('src/components/PrivacyPolicy.tsx', 'utf8');

content = content.replace(/ShieldCheck, MessageCircle/g, 'ShieldCheck');
content = content.replace(/Check, MessageCircleCircle/g, 'CheckCircle');
content = content.replace(/Check, MessageCircle/g, 'Check, MessageCircle');

fs.writeFileSync('src/components/PrivacyPolicy.tsx', content, 'utf8');
