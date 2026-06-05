import path from "path";
import { fileURLToPath } from 'url';
import { buildCSS, buildJS, buildPHP, buildSitemap } from "chokibasic";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const phpin = 'src';
const srcin = path.resolve(__dirname, "../src/");
const jsin = path.resolve(srcin, "scripts/mei.core.js");
const jsout = path.resolve(srcin, "scripts/mei.core.min.js");
const cssin = path.resolve(srcin, "styles/mei.core.scss");
const cssout = path.resolve(srcin, "styles/mei.core.min.css");


(async () => {
	await buildJS(jsin, jsout);
	await buildCSS(cssin, cssout);
	await buildPHP(phpin);
	await buildSitemap(phpin);
})();