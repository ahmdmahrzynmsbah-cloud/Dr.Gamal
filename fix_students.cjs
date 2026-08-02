const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

// The error was replacing all "    </motion.div>"
// Let's replace "    </motion.div>\n    </motion.div>" back to "    </motion.div>" globally
content = content.replace(/    <\/motion.div>\n    <\/motion.div>/g, '    <\/motion.div>');

// Now add the actual closing tag right before the final `  );`
const endMatch = '    </motion.div>\n  );\n}';
const endReplace = '    </motion.div>\n    </motion.div>\n  );\n}';
content = content.replace(endMatch, endReplace);

// Also need to use React fragment <> instead of `<motion.div>` wrapper since motion.div wrapper is unneeded.
// Wait, the main Render target replacement was:
// const mainRenderReplacement = '  return (\n    <motion.div>\n' + progressOverlayCode + '\n      <motion.div ';
// Let's replace `return (\n    <motion.div>\n` with `return (\n    <>\n`
content = content.replace('  return (\n    <motion.div>\n', '  return (\n    <>\n');

// And replace the end `</motion.div>\n    </motion.div>\n  );\n}` with `</motion.div>\n    </>\n  );\n}`
content = content.replace('    </motion.div>\n    </motion.div>\n  );\n}', '    </motion.div>\n    </>\n  );\n}');

fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
