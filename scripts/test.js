import path from "path";
import { fileURLToPath } from 'url';
// import { render, sitemap } from '../../kirigami/kirigami/packages/prepros/index.js';
// import { render, sitemap } from '@kirigami/php-prepros';
import { walkFile } from '@kirigami/struct-walker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcin = path.resolve(__dirname, "../src/");


// console.log(await render('_index.php'));
// console.log(await render('test/_index.php'));
// console.log(await render());
// console.log(await render('src/medias/_index.php'));


console.log(await walkFile(path.join(srcin, 'medias/_articles.yaml'), true));

// console.log(await sitemap());













// import path from "path";
// import { fileURLToPath } from 'url';
// import { buildPHP, buildSitemap } from "../../chokibasic/index.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const srcin = path.resolve(__dirname, "../src/");

// (async () => {
// 	await buildPHP('src');
// 	// await buildPHP('src/medias/_index.php');
// 	await buildSitemap('src');
// })();