const fs = require('fs');
const path = require('path');

const files = [
  './routes/auth.ts',
  './routes/tasks.ts', 
  './routes/users.ts',
  './routes/team.ts',
  './server.ts',
  './index.ts',
  './middleware/auth.ts',
  './middleware/errorHandler.ts',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace imports that don't end with .js
  content = content.replace(/from ['"](\.[^'"]+)(?<!\.js)['"]/g, (match, p1) => {
    return `from '${p1}.js'`;
  });
  
  fs.writeFileSync(file, content);
  console.log(`Fixed: ${file}`);
});
