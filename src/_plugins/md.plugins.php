<?php

// {% galerie le-grand-sursaut-2 %}
MD::registerPlugin('galerie', function (array $args, string $body): string {
    $id = htmlspecialchars($args[0] ?? '', ENT_QUOTES, 'UTF-8');
    if ($id === '') return '<!-- galerie: id manquant -->';
	return "<gallery id=\"{$id}\"></gallery>";
});