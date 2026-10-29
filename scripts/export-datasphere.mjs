import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
let html=await readFile(path.join(root,'connected-enterprise.html'),'utf8');
html=html.replace('<html lang="en">','<html lang="en" class="standalone">');
html=html.replace(/<a class="hub-back"[^>]*>.*?<\/a>/,'');
// Every stylesheet, font and logo is embedded. Opening file:// needs no server or network.
for(const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]) {
  const location=path.join(root,match[1]);
  let css=await readFile(location,'utf8');
  for(const font of [...css.matchAll(/url\(([^)]+)\)/g)]) {
    const name=font[1].replace(/["']/g,'');
    const bytes=await readFile(path.resolve(path.dirname(location),name));
    css=css.replace(font[0],`url(data:font/woff2;base64,${bytes.toString('base64')})`);
  }
  html=html.replace(match[0],`<style>\n${css}\n</style>`);
}
const logo=await readFile(path.join(root,'assets/brand/ameritech-colored.svg'));
html=html.replaceAll('src="assets/brand/ameritech-colored.svg"',`src="data:image/svg+xml;base64,${logo.toString('base64')}"`);
html=html.replace('AMERIVERSE DATASPHERE · SYNTHETIC DEMO · NO LIVE CONNECTIONS','AMERIVERSE DATASPHERE · STANDALONE EDITION · SYNTHETIC DEMO · NO LIVE CONNECTIONS');
const external=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].filter(match=>!match[1].startsWith('data:')&&!match[1].startsWith('#'));
if(external.length)throw Error('Standalone export has external references: '+external.map(m=>m[1]).join(', '));
const directory=path.join(root,'downloads');
await mkdir(directory,{recursive:true});
const destination=path.join(directory,'AmeriVerse-Datasphere-Standalone.html');
await writeFile(destination,html);
console.log(`Exported ${path.relative(root,destination)} (${Buffer.byteLength(html)} bytes), with embedded vector branding and fonts.`);
