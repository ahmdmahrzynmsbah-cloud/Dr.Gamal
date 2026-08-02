const fs = require('fs');
let content = fs.readFileSync('src/components/PrivacyPolicy.tsx', 'utf8');

const target = `    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.004 2C6.48 2 2.001 6.477 2.001 12c0 1.891.525 3.66 1.439 5.171L2 22l5.002-1.314c1.472.805 3.155 1.265 4.945 1.265 5.524 0 10.003-4.478 10.003-10S17.528 2 12.004 2zm5.727 14.195c-.244.688-1.201 1.249-1.656 1.306-.412.051-.837.081-1.396-.113-.719-.244-1.611-.564-2.73-1.057-4.42-1.954-7.279-6.425-7.5-6.719-.221-.294-1.801-2.394-1.801-4.568 0-2.174 1.132-3.243 1.536-3.684.404-.441.883-.551 1.177-.551.294 0 .588.006.845.019.264.013.621-.099.972.735.362.861 1.238 3.018 1.344 3.239.106.221.177.478.031.772-.147.294-.32.478-.551.742-.231.264-.485.588-.693.79-.228.221-.466.463-.202.915.264.452 1.173 1.93 2.518 3.125 1.734 1.542 3.195 2.022 3.647 2.242.452.221.721.184.99-.123.269-.307 1.149-1.331 1.454-1.785.305-.454.61-.378 1.026-.227.416.151 2.637 1.242 3.09 1.47.453.227.755.342.866.531.111.189.111 1.096-.133 1.785z"/>
        </svg>
      ),
      url: "https://wa.me/201034859313",
      color: "bg-[#25D366]/15 text-emerald-400 hover:bg-[#25D366] hover:text-white border border-[#25D366]/20"
    },`;

const replacement = `    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      url: "https://wa.me/201034859313",
      color: "bg-[#25D366]/15 text-emerald-400 hover:bg-[#25D366] hover:text-white border border-[#25D366]/20"
    },`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/PrivacyPolicy.tsx', content, 'utf8');
    console.log("Patched WhatsApp icon");
} else {
    console.log("Could not find WhatsApp icon target block");
}
