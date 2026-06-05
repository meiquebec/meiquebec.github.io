import { readdirSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

const SRCDIR = resolve(__dirname, '../assets/galleries');
const DSTDIR = resolve(__dirname, '../src/images/galeries');
const JSONFILE = resolve(__dirname, '../src/data/galleries.json');

// Équivalent de FS::rmdir($DSTDIR, false) — vide le dossier sans le supprimer
if (existsSync(DSTDIR)) {
	rmSync(DSTDIR, { recursive: true });
}
mkdirSync(DSTDIR, { recursive: true });

const galleries = [];

for (const entry of readdirSync(SRCDIR, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;

	const galleryName = entry.name.toLowerCase();
	const galleryDst = join(DSTDIR, galleryName);
	mkdirSync(galleryDst, { recursive: true });

	const srcGalleryDir = join(SRCDIR, entry.name);
	const entries = readdirSync(srcGalleryDir, { withFileTypes: true });

	let fileId = 0;
	const files = [];

	for (const file of entries) {
		if (!file.isFile()) continue;

		const ext = extname(file.name).replace('.', '').toLowerCase();
		if (!EXTENSIONS.includes(ext)) continue;

		const filename = String(++fileId).padStart(2, '0');
		const src = join(srcGalleryDir, file.name);
		const dst = join(galleryDst, `${filename}.webp`);
		const dsttb = join(galleryDst, `${filename}_tb.webp`);

		console.log(src);

		// Contain 1280×960
		await sharp(src)
			.resize(1280, 960, { fit: 'inside' })
			.webp({ quality: 85 })
			.toFile(dst);

		// Cover 240×320
		await sharp(src)
			.resize(240, 320, { fit: 'cover', position: 'centre' })
			.webp({ quality: 85 })
			.toFile(dsttb);

		files.push({
			src: `/images/galeries/${galleryName}/${basename(dst)}`,
			tbn: `/images/galeries/${galleryName}/${basename(dsttb)}`,
		});
	}

	galleries.push({ name: galleryName, files });
}

writeFileSync(JSONFILE, JSON.stringify(galleries, null, 4).replaceAll('\\/', '/'));