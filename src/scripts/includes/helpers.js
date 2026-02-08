/******************************************************
 *                    Create Element                  *
 ******************************************************/
self.create = (tag, classname=null, content=null, attrs={}) => {
    const elm = document.createElement(tag);
    if(classname) elm.className = classname;
    if(content) elm.innerHTML = content;
	Object.entries(attrs).forEach(a => elm.setAttribute(a[0], a[1]));
    return elm;
}
HTMLElement.prototype.create = function(tag, classname=null, content=null, attrs={}) {
    const elm = create(tag, classname, content, attrs);
    this.append(elm);
    return elm;
}


/******************************************************
 *               DOMDocument async loaded             *
 ******************************************************/
self.documentReady = function(clb = null) {
	return new Promise((res) => {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", async () => {
				if(clb) clb();
				res();
			}, { once: true });
		} else {
			if(clb) clb();
			res();
		}
	});
}


/******************************************************
 *             Compute root document font             *
 ******************************************************/
self.rem = (n) => {
	return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
}


/******************************************************
 *                    Preload image                   *
 ******************************************************/
self.preloadImage = url => {
	return new Promise((res, rej) => {
		const img = new Image();
		img.decoding = 'async';
		img.loading = 'eager';
		img.onload = () => res('preloaded');
		img.onerror = rej;
		img.src = url;
		if (img.complete && img.naturalWidth > 0) res('memory-cache');
	});
}


/******************************************************
 *           Load Json properties for target          *
 ******************************************************/
self.loadJsonProperties = async function(target, files = {}) {
	const entries = Object.entries(files);
	const results = await Promise.allSettled(
		entries.map(async ([key, url]) => {
			const res = await fetch(url);
			let data = null;
			try { data = await res.json(); } catch (_) { }
			return { key, url, status: res.status, ok: res.ok, data };
		})
	);
	for (const r of results) {
		if (r.status === 'fulfilled') {
			const { key, url, status, ok, data } = r.value;
			if (!ok) {
				console.error(`${key} [${status} - ERREUR] ${url}`);
				continue;
			}
			target[key] = data;
		} else {
			console.error('Erreur réseau/JS pendant le chargement :', r.reason);
		}
	}
	return target;
};


/******************************************************
 *             Body lock while working/busy           *
 ******************************************************/
self.busy = async (promise) => {
	document.documentElement.classList.add('is-busy');	
	const results = await Promise.allSettled(typeof promise == 'array' ? promise : [promise]);
	document.documentElement.classList.remove('is-busy');
	return typeof promise == 'array' ? results : results[0];
};
self.working = async (promise) => {
	document.documentElement.classList.add('is-working');	
	const results = await Promise.allSettled(typeof promise == 'array' ? promise : [promise]);
	document.documentElement.classList.remove('is-working');
	return typeof promise == 'array' ? results : results[0];
};


