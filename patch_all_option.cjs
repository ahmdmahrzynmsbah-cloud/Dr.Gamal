const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

// 1. Remove "all" option from select
const oldSelect = `<option value="all">جميع المجموعات</option>`;
content = content.replace(oldSelect, ``);

// 2. Change matchesClass
const oldMatches = `const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;`;
const newMatches = `const matchesClass = s.class_id === selectedClass;`;
content = content.replace(oldMatches, newMatches);

// 3. markUnscannedAsAbsent
const oldMarkUnscanned = `if (selectedClass === 'all') {`;
const newMarkUnscanned = `if (!selectedClass) {`;
content = content.replace(oldMarkUnscanned, newMarkUnscanned);

// 4. Table headers and cells
const oldTableCol1 = `{selectedClass === 'all' && <th className="px-4 py-3">المجموعة</th>}`;
content = content.replace(oldTableCol1, ``);

const oldTableCol2 = `{selectedClass === 'all' && (
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{classObj?.name || '-'}</td>
                      )}`;
content = content.replace(oldTableCol2, ``);

const oldPrintHeaderName = `{selectedClass === 'all' ? 'جميع المجموعات' : classes.find(c => c.id === selectedClass)?.name}`;
const newPrintHeaderName = `{classes.find(c => c.id === selectedClass)?.name || ''}`;
content = content.replace(oldPrintHeaderName, newPrintHeaderName);

const oldPrintCol1 = `{selectedClass === 'all' && (
                <th className="py-3 px-4 font-bold text-slate-900">المجموعة</th>
              )}`;
content = content.replace(oldPrintCol1, ``);

const oldPrintCol2 = `{selectedClass === 'all' && (
                      <td className="py-2 px-4 text-slate-700">{classObj?.name || '-'}</td>
                    )}`;
content = content.replace(oldPrintCol2, ``);

// colSpan updates
const oldColSpanPrint = `<td colSpan={selectedClass === 'all' ? 6 : 5} className="py-8 text-center text-slate-500 font-bold">`;
const newColSpanPrint = `<td colSpan={5} className="py-8 text-center text-slate-500 font-bold">`;
content = content.replace(oldColSpanPrint, newColSpanPrint);

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
console.log("Done");
