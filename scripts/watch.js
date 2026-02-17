const path = require("node:path");
const { createWatchers, buildCSS, buildJS, buildPHP } = require("chokibasic");

const cssIn = path.resolve(__dirname, "../src/styles/mei.core.scss");
const cssOut = path.resolve(__dirname, "../src/styles/mei.core.min.css");
const jsIn = path.resolve(__dirname, "../src/scripts/mei.core.js");
const jsOut = path.resolve(__dirname, "../src/scripts/mei.core.min.js");


const { close } = createWatchers(
	[
		{
			name: "js",
			patterns: ["src/scripts/**/*.js"],
			ignored: ["**/*.min.js"],
			callback: async (events) => {
				console.log("[js] batch", events.length, events.map(e => e.file));
				await buildJS(jsIn, jsOut);
				console.log("");
			},
		},
		{
			name: "scss",
			patterns: ["src/styles/**/*.scss"],
			callback: async (events) => {
				console.log("[scss] batch", events.length, events.map(e => e.file));
				await buildCSS(cssIn, cssOut);
				console.log("");
			},
		},
		{
			name: "php",
			patterns: ["src/**/_*.php"],
			callback: async (events) => {
				console.log("[php] batch", events.length, events.map(e => e.file));
				await Promise.all(events.map(e => buildPHP(e.file)));
				console.log("");
			},
		},
	],
	{
		cwd: process.cwd(),
		debug: true
	}
);


process.on("SIGINT", async () => {
	await close();
	process.exit(0);
});