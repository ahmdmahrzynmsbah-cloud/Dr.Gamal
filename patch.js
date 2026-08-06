const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// The file currently has:
// const [currentTime, setCurrentTime] = useState(new Date());
//     return (
//     <SystemClock />
//   );
// };
// export default function Dashboard({ onNavigateToTab }: DashboardProps) {

code = code.replace(/const \[currentTime, setCurrentTime\] = useState\(new Date\(\)\);[\s\S]*?export default function Dashboard\(\{ onNavigateToTab \}: DashboardProps\) \{/, `export default function Dashboard({ onNavigateToTab }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
`);

fs.writeFileSync('src/components/Dashboard.tsx', code);
