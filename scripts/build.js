const path = require("node:path");
const { buildCSS, buildJS, buildPHP, buildSitemap } = require("chokibasic");


const srcin = path.resolve(__dirname, "../src/");
const jsin = path.resolve(srcin, "scripts/mei.core.js");
const jsout = path.resolve(srcin, "scripts/mei.core.min.js");
const cssin = path.resolve(srcin, "styles/mei.core.scss");
const cssout = path.resolve(srcin, "styles/mei.core.min.css");


(async () => {
	await buildJS(jsin, jsout);
	await buildCSS(cssin, cssout);
	await buildPHP(srcin);
	await buildSitemap(srcin);
})();