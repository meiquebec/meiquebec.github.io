<?php
require_once(__DIR__ . '/../node_modules/pxpros/src/utils.inc.php');
const EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp'];


$SRCDIR = realpath(__DIR__ . '/../assets/galleries') . '/';
$DSTDIR = realpath(__DIR__ . '/../src/images/galeries') . '/';
$JSONFILE = realpath(__DIR__ . '/../src/data') . '/galleries.json';

FS::rmdir($DSTDIR, false);
$galleries = [];

foreach (glob($SRCDIR . '*', GLOB_ONLYDIR) as $dir) {
	$gallery_name = strtolower(pathinfo($dir, PATHINFO_FILENAME));
	mkdir($DSTDIR . $gallery_name, 0777, true);

	$fileId = 0;
	$files = [];
	foreach (glob($dir . '/*') as $src) {
		if (!in_array(strtolower(pathinfo($src, PATHINFO_EXTENSION)), EXTENSIONS)) continue;
		$filename = sprintf('%02u', ++$fileId);
		$dst = $DSTDIR . $gallery_name . '/' . $filename . '.webp';
		$dsttb = $DSTDIR . $gallery_name . '/' . $filename . '_tb.webp';

		echo $src . RN;

		(new IMG($src))->resize(1280, 960)->save($dst);
		(new IMG($src))->resize(240, 320, true)->save($dsttb);

		$files[] = [
			'src' => '/images/galeries/' . $gallery_name . '/' . pathinfo($dst, PATHINFO_BASENAME),
			'tbn' => '/images/galeries/' . $gallery_name . '/' . pathinfo($dsttb, PATHINFO_BASENAME),
		];
	}

	$galleries[] = [
		'name' => $gallery_name,
		'files' => $files
	];
}

file_put_contents($JSONFILE, json_encode($galleries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));