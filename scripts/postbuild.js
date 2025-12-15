
import fs from 'fs';
import path from 'path';

const srcProto = path.join(process.cwd(), 'index.html');
const destProto = path.join(process.cwd(), 'dist', 'index.html');

if (fs.existsSync(srcProto)) {
    let content = fs.readFileSync(srcProto, 'utf-8');

    // Replace the dev script with the production built script
    // Dev: <script type="module" src="/src/widget.ts"></script>
    // Prod: <script src="./widget.iife.js"></script>
    content = content.replace(
        /<script type="module" src="\/src\/widget\.ts"><\/script>/,
        '<script src="./widget.iife.js"></script>'
    );

    if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
        fs.mkdirSync(path.join(process.cwd(), 'dist'));
    }

    fs.writeFileSync(destProto, content);
    console.log('Copied and patched index.html to dist/');
}
