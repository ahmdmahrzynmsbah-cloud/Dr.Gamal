const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Define ClockComponent
const clockComponent = `
const SystemClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2.5 bg-[#E8192C]/5 px-4 py-2 rounded-xl text-[#C0152A] text-xs font-semibold border border-[#E8192C]/10 self-start md:self-auto font-sans">
      <Calendar className="w-4 h-4 text-[#C0152A]" />
      <span className="whitespace-nowrap">توقيت النظام:</span>
      <span className="font-bold">
        {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
      <span className="text-[#C0152A] font-mono tracking-wide font-extrabold bg-[#E8192C]/10 px-2 py-0.5 rounded">
        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </span>
    </div>
  );
};
`;

// Insert the clockComponent right before the Dashboard function
content = content.replace(
  /export default function Dashboard/,
  clockComponent + '\nexport default function Dashboard'
);

// 2. Remove state and effect from Dashboard
content = content.replace(
  /const \[currentTime, setCurrentTime\] = useState\(new Date\(\)\);\s*useEffect\(\(\) => \{\s*const timer = setInterval\(\(\) => \{\s*setCurrentTime\(new Date\(\)\);\s*\}, 1000\);\s*return \(\) => clearInterval\(timer\);\s*\}, \[\]\);/g,
  ''
);

// 3. Replace the inline clock JSX with <SystemClock />
content = content.replace(
  /<div className="flex items-center gap-2\.5 bg-\[#E8192C\]\/5 px-4 py-2 rounded-xl text-\[#C0152A\] text-xs font-semibold border border-\[#E8192C\]\/10 self-start md:self-auto font-sans">[\s\S]*?<\/div>/,
  '<SystemClock />'
);

fs.writeFileSync('src/components/Dashboard.tsx', content, 'utf8');
