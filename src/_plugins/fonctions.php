<?php

/**
 * Petites fonctions de présentation partagées par les pages.
 */


// « 2025-11-01 » → « 1er nov. 2025 » (abréviations de l'Office québécois de
// la langue française). Une valeur qui n'est pas une date ISO est rendue telle
// quelle.
function date_fr(string $iso): string
{
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $iso, $m)) return $iso;
    $mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    $jour = (int) $m[3];
    return ($jour === 1 ? '1er' : $jour) . ' ' . $mois[(int) $m[2] - 1] . ' ' . $m[1];
}
