const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/الصف الأول الإبتدائي/g, "الأول الإبتدائي");
        content = content.replace(/الصف الثاني الإبتدائي/g, "الثاني الإبتدائي");
        content = content.replace(/الصف الثالث الإبتدائي/g, "الثالث الإبتدائي");
        content = content.replace(/الصف الرابع الإبتدائي/g, "الرابع الإبتدائي");
        content = content.replace(/الصف الخامس الإبتدائي/g, "الخامس الإبتدائي");
        content = content.replace(/الصف السادس الإبتدائي/g, "السادس الإبتدائي");
        
        content = content.replace(/الصف الأول الإعدادي/g, "الأول الإعدادي");
        content = content.replace(/الصف الثاني الإعدادي/g, "الثاني الإعدادي");
        content = content.replace(/الصف الثالث الإعدادي/g, "الثالث الإعدادي");
        
        content = content.replace(/الصف الأول الثانوي/g, "الأول الثانوي");
        content = content.replace(/الصف الثاني الثانوي/g, "الثاني الثانوي");
        content = content.replace(/الصف الثالث الثانوي/g, "الثالث الثانوي");
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

replaceInFile('src/components/Dashboard.tsx');
replaceInFile('src/components/FeesTracker.tsx');
replaceInFile('src/components/StudentsList.tsx');
replaceInFile('src/components/ClassesManager.tsx');
replaceInFile('src/utils/feeReminderService.ts');
replaceInFile('src/utils/constants.ts');

