const fs = require('fs');

// 1. Update LoginScreenProps in LoginScreen.tsx
let lsContent = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');
lsContent = lsContent.replace(
  "onLoginSuccess: (role: 'teacher' | 'secretary', name: string, userId?: string) => void;",
  "onLoginSuccess: (role: 'teacher' | 'secretary', name: string, userId?: string) => void;\n  isDarkMode?: boolean;\n  onToggleDarkMode?: () => void;"
);

lsContent = lsContent.replace(
  "export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {",
  "import ThemeToggle from './ThemeToggle';\nexport default function LoginScreen({ onLoginSuccess, isDarkMode = false, onToggleDarkMode }: LoginScreenProps) {"
);

const loginHeader = `<div className="bg-[#0D5C8C] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center">`;
const newLoginHeader = `<div className="absolute top-4 left-4 z-50">
          {onToggleDarkMode && (
            <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            </div>
          )}
        </div>
        <div className="bg-[#0D5C8C] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center">`;

lsContent = lsContent.replace(loginHeader, newLoginHeader);
fs.writeFileSync('src/components/LoginScreen.tsx', lsContent, 'utf8');

// 2. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  "<LoginScreen\n        onLoginSuccess",
  "<LoginScreen\n        isDarkMode={isDarkMode}\n        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}\n        onLoginSuccess"
);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log("Patched LoginScreen for ThemeToggle.");
