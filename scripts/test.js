import path from "path";
import { fileURLToPath } from 'url';
import { buildPHP, buildSitemap } from "../../chokibasic/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcin = path.resolve(__dirname, "../src/");

(async () => {
	await buildPHP('src');
	// await buildPHP('src/medias/_index.php');
	await buildSitemap('src');
})();