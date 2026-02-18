<?php
require_once(__DIR__ . '/../node_modules/pxpros/src/utils.inc.php');


error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('serialize_precision', '-1');
ini_set('precision', '14');


$comiteFile = realpath(pathinfo(__DIR__, PATHINFO_DIRNAME).'/src/data/comites.json');
$secretFile = realpath(pathinfo(__DIR__, PATHINFO_DIRNAME).'/src/bt1oh97j7X.bin');

if(!$comiteFile || !$secretFile) {
	echo "Missing configuration files.".RN;
	exit(1);
}


$comites = json_decode(file_get_contents($comiteFile));
$secrets = OBF::decode(file_get_contents($secretFile));


foreach($comites as $item) {
	if(!empty($item->location)) continue;
	$item->location = getGeocode($item->address, $secrets->GOOGLE_API_KEY);
	print_r($item);
	sleep(1);
}

file_put_contents($comiteFile, json_encode($comites, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));


function getGeocode($address, $apikey) {
	$url = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=" . urlencode($apikey);
	if(!$json = @file_get_contents($url, false, stream_context_create(["http" => ["timeout" => 10]]))) return false;
	if(!$data = json_decode($json, true)) return false;
	if(!is_array($data)) return false;
	if(($data["status"] ?? "") !== "OK") return false;
	return $data["results"][0]["geometry"]["location"];
}