const fs = require("node:fs");
const path = require("node:path");

const { createWatchers, buildCSS, buildJS } = require("./watcher");
const { close } = createWatchers(
	[
		{
			name: "js",
			patterns: ["src/scripts/**/*.js"],
			ignored: ["**/*.min.js"],
			debounceMs: 150,
			callback: async (events) => {
				console.log("[js] batch", events.length, events.map(e => e.file));
				const entry = path.resolve(__dirname, "../src/scripts/mei.core.js");
				const outfile = path.resolve(__dirname, "../src/scripts/mei.core.min.js");
				buildJS(entry, outfile);
			},
		},
		{
			name: "scss",
			patterns: ["src/styles/**/*.scss"],
			debounceMs: 150,
			callback: async (events) => {
				console.log("[scss] batch", events.length, events.map(e => e.file));
				const inputScss = path.resolve(__dirname, "../src/styles/mei.core.scss");
				const outCssMin = path.resolve(__dirname, "../src/styles/mei.core.min.css");
				buildCSS(inputScss, outCssMin);
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




