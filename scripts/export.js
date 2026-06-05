import path from "path";
import { fileURLToPath } from 'url';
import { exportDist } from "chokibasic";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = process.cwd();
const SRC = path.join(DIR, 'src');
const DIST = path.join(DIR, 'dist');
const BANNER = path.join(__dirname, 'banner.txt');


(async () => {
	try {
		const stats = await exportDist(SRC, DIST, BANNER);
		console.log(`✅ Export finished.`);
		console.log(`   Files copied : ${stats.copied}`);
		console.log(`   Files ignored : ${stats.skipped}`);
		process.exit(0);
	} catch(err) {
		console.error('❌ Build failed:', err);
		process.exit(1);
	}
})();

