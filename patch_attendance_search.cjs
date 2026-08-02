const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

// Add searchTerm state
const stateTarget = `  const [selectedClass, setSelectedClass] = useState('all');`;
const stateReplacement = `  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');`;

if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplacement);
} else {
    console.log("Could not find state target");
}

// Update the rendering logic that uses 'students' to filter by selectedClass AND searchTerm, wrapped in useMemo
const filterTarget = `{students
                  .filter(s => selectedClass === 'all' || s.class_id === selectedClass)
                  .map(student => {`;
const filterReplacement = `{useMemo(() => {
                  return students.filter(s => {
                    const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
                    const matchesSearch = !searchTerm || s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
                    return matchesClass && matchesSearch;
                  });
                }, [students, selectedClass, searchTerm]).map(student => {`;

if (content.includes(filterTarget)) {
    content = content.replace(filterTarget, filterReplacement);
} else {
    console.log("Could not find filter target, looking for alternative...");
}

// Add the search input UI next to the class selector
const uiTarget = `              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 py-2 focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden cursor-pointer"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>`;
const uiReplacement = `              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 py-2 focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden cursor-pointer"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث عن طالب..."
                  className="w-48 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden text-slate-700 dark:text-slate-200 font-bold"
                />
              </div>
            </div>`;

if (content.includes(uiTarget)) {
    content = content.replace(uiTarget, uiReplacement);
} else {
    console.log("Could not find ui target");
}

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
console.log("Attendance tracker patched");
