const path = require("node:path");
const { buildCSS, buildJS, buildPHP } = require("chokibasic");


const srcin = path.resolve(__dirname, "../src/");
const jsin = path.resolve(__dirname, "../src/scripts/mei.core.js");
const jsout = path.resolve(__dirname, "../src/scripts/mei.core.min.js");
const cssin = path.resolve(__dirname, "../src/styles/mei.core.scss");
const cssout = path.resolve(__dirname, "../src/styles/mei.core.min.css");


(async () => {
	await buildPHP(srcin);
	await buildJS(jsin, jsout);
	await buildCSS(cssin, cssout);
})();