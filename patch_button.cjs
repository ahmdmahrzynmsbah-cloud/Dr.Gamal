const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const target = `<button 
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="عرض أرشيف الطلاب والملفات الملغاة"
          >`;

const replacement = `<button 
            type="button"
            onClick={() => setShowDuplicatesModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="فحص البيانات المكررة ودمجها"
          >
            <Users className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">البيانات المكررة</span>
          </button>
          <button 
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="عرض أرشيف الطلاب والملفات الملغاة"
          >`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
    console.log("Patched button");
} else {
    console.log("Target not found");
}
