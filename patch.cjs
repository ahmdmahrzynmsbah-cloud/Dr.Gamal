const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<div className="hidden md:block relative z-50">[\s\S]*?width: isSearchFocused \? 384 : 280,/, `<div className="hidden md:flex relative z-50 flex-1 min-w-0 max-w-md mx-4">
            <motion.div 
              initial={false}
              animate={{ 
                width: "100%",`);

fs.writeFileSync('src/App.tsx', code);
