import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gunzipSync } from 'zlib';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');

const comiteFile = resolve(root, 'src/data/comites.json');
const secretFile = resolve(root, 'src/bt1oh97j7X.bin');

// === OBF::decode ===
function obfDecode(buffer) {
	const withHeader = Buffer.concat([Buffer.from([0x1f, 0x8b]), buffer]);
	const inflated = gunzipSync(withHeader).toString('utf8');
	const base64 = rot13(inflated);
	const json = Buffer.from(base64, 'base64').toString('utf8');
	return JSON.parse(json);
}

function rot13(str) {
	return str.replace(/[a-zA-Z]/g, c => {
		const base = c <= 'Z' ? 65 : 97;
		return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
	});
}

// === Geocoding ===
async function getGeocode(address, apiKey) {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(apiKey)}`;
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
		const data = await res.json();
		if (data?.status !== 'OK') return null;
		return data.results[0].geometry.location;
	} catch {
		return null;
	}
}

// === Main ===
const comites = JSON.parse(readFileSync(comiteFile, 'utf8'));
const secrets = obfDecode(readFileSync(secretFile));

for (const item of comites) {
	if (item.location) continue;

	item.location = await getGeocode(item.address, secrets.GOOGLE_API_KEY);
	console.log(item);

	await new Promise(r => setTimeout(r, 1000)); // sleep(1)
}

writeFileSync(comiteFile, JSON.stringify(comites, null, 4));