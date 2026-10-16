# DockFlow — Audit design front-end (16/10/2026)

Base : V1.3.1 en ligne, 12 écrans capturés (6 en clair, 6 en sombre) en taille iPhone 17 Pro (402 × 874).
Captures : `captures/audit/`.

## Les 5 plus gros défauts
1. **Trop d'alertes sur l'écran Jour.** Le bloc « À relancer » (6 cartes rouges) est aussi gros que la liste des commandes et la pousse hors de l'écran. Les mêmes commandes apparaissent deux fois. Quand tout est rouge, le rouge ne signale plus rien.
2. **L'orange est utilisé pour tout.** Logo, bouton principal, bouton +, liens, sélection, thème « Auto »… Le bouton rouge « Vider les données » ressemble au bouton orange principal.
3. **Une typographie sans système.** Trop de tailles différentes, des libellés minuscules (10–11 px) et des gris peu lisibles, surtout en sombre.
4. **Équipe et Réglages font inachevés.** De grands vides, une pile de 7 boutons identiques sans regroupement, et une action destructrice présentée comme une action principale.
5. **Des composants incohérents.** 4 arrondis différents, des sélecteurs qui ne se ressemblent pas (« Auj. » en noir, « Auto » en orange), et des champs date et heure natifs de Safari dans « Nouvelle commande ».

## P0 — Structure
- **Écran Jour recentré sur « quoi faire maintenant »** : « À relancer » replié en une ligne (« 6 à relancer › ») qui se déplie, une seule liste chronologique avec un point de sévérité, et un en-tête collant au défilement.
- **Système de couleurs par sens** :
  - orange = action principale uniquement ;
  - rouge = bloquant ;
  - ambre = à surveiller (attente client) ;
  - liens en encre ;
  - destructif en rouge contour.
- **Échelle typographique stricte** en 6 tailles, avec des chiffres tabulaires et le monospace réservé aux numéros.

## P1 — Rythme et composants
- Grille de 4/8 px, un seul arrondi pour les cartes (16) et un pour les contrôles (12).
- Bibliothèque de composants : 4 types de boutons, une pastille de statut, une carte de commande commune (Jour, Camions et Équipe), un sélecteur segmenté commun.
- Camions : conditionnement structuré (« 3 pal. · 18 colis » en gras, le détail des gaines repliable). « Répartir » passe dans un menu.
- Équipe : une liste de personnes (avatar à initiales, rôle, nombre de commandes du jour), avec un mode d'édition.
- Réglages : sections Apparence, Rapports, Sauvegarde et Zone de danger, en lignes avec icône et chevron.
- Nouvelle commande :
  - remplacer les champs natifs par un ruban de dates (Auj., Demain, J+2, Autre) et une roue d'heure ;
  - autocomplétion des clients récents ;
  - le bouton « Ajouter » indique ce qui manque.

## P2 — Navigation, icônes, états vides, marque
- Le titre se réduit dans la barre au défilement, et la barre d'onglets se masque au défilement vers le bas.
- Le bouton + change de rôle selon l'onglet.
- Icônes : un seul trait (1,75 px), des icônes dans les lignes de Réglages, une icône carton pour les manquants.
- États vides illustrés, avec une action : « Aucun camion chargé », « Rien demain ».
- Marque : la barre segmentée devient le motif signature (journée, chargement du camion, commande), avec un logo palette/quai.
- Sombre :
  - 4 niveaux de surfaces ;
  - bordures blanches à 8–10 % ;
  - texte #E8EAED au lieu du blanc pur ;
  - rouge texte désaturé ;
  - orange légèrement atténué.

## P3 — Animations
- Le bouton + se transforme en fenêtre « Nouvelle commande » (transition d'élément partagé), et la nouvelle carte se pose dans la liste avec un éclair.
- Barre segmentée : les segments se remplissent quand un statut change.
- « Résolu » : la ligne rouge se replie, la pastille change de couleur et la carte se réajuste en douceur.
- « À relancer » : repli et dépli avec ressort, et les cartes traitées glissent hors de la liste.
- Compteur « 6 sur 6 prêtes » : pulsation et halo discret quand la journée est complète.
- Camions : jauge de remplissage par camion qui se met à jour au chargement.
- Barre d'onglets : l'icône se remplit à la sélection.
- Respect de « réduire les animations ».
