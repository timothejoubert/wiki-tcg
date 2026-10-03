# TODO

## Boosters
- [x] Ouvrir les cartes une par une lorsqu'on ouvre un booster
- [x] **Ouvrir le booster d'un geste** : remplacer le simple clic par un geste satisfaisant, par
      exemple trancher le paquet d'un glissement (« slice ») le long de la bande du haut, au doigt
      sur mobile et à la souris sur desktop.
  - retour visuel qui suit le geste, découpe qui se propage le long de la bande
  - vibration si disponible (`navigator.vibrate`)
  - garder un bouton pour le clavier et pour `prefers-reduced-motion` (RGAA)
  - point de départ : `inertia/components/booster_pack.vue`
- [x] **Découvrir les cartes au swipe** : après l'ouverture, présenter les cartes en pile et les
      faire défiler d'un swipe satisfaisant (la carte du dessus suit le doigt, s'incline, puis part
      sur le côté pour révéler la suivante), au doigt et à la souris.
  - inertie et retour élastique si le geste est trop court
  - montée en intensité pour les raretés hautes (lueur, vibration plus marquée)
  - garder les boutons « Suivante » et « Tout retourner » pour le clavier et `prefers-reduced-motion`
  - point de départ : `inertia/pages/boosters/show.vue`
  - Dans la page de reveal, une fois que toutes les cartes sont découvertes, il faut un button pour ouvrir les prochains paquet disponnible

## Déjà identifié
- [ ] Fonctionnalité d'abandons/recyclage de carte groupé
- [ ] Charger les typographies du design (Unbounded, Inter, JetBrains Mono)
- [ ] Figma : carte v5 (sans étiquette de rareté ni stats, format 5:7 comme dans l'app), puis écrans mobiles, au retour du quota MCP
- [ ] Rédiger les conditions d'utilisation et les règles de la communauté (textes provisoires)
- [ ] Mise en production : hébergement, Postgres (extension `unaccent`), scheduler, SMTP, variables d'environnement
