<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'
import LegalPage from '~/components/legal_page.vue'
import { legal } from '~/lib/legal'
</script>

<template>
  <LegalPage title="Confidentialité">
    <p>
      Cette page explique quelles données {{ legal.site }} traite, pourquoi, et comment exercer tes
      droits (Règlement général sur la protection des données, RGPD).
    </p>

    <h2>Responsable du traitement</h2>
    <p>{{ legal.publisher }}, joignable à : {{ legal.contactEmail }}.</p>

    <h2>Données traitées</h2>
    <ul>
      <li>
        <strong>Compte</strong> : identifiant, adresse email, mot de passe (stocké haché, jamais en
        clair), date de confirmation de majorité.
      </li>
      <li>
        <strong>Jeu</strong> : collection, wikis et historique des mouvements, favoris et tags,
        enchères, mises et échanges.
      </li>
      <li>
        <strong>Sécurité</strong> : adresse IP conservée quelques minutes pour limiter les
        tentatives de connexion, liens de réinitialisation (valables 1 h) et de changement d'email
        (24 h), stockés sous forme d'empreinte.
      </li>
    </ul>
    <p>
      Aucune donnée n'est collectée à des fins publicitaires, et aucun outil de mesure d'audience ou
      de pistage n'est utilisé.
    </p>

    <h2>Finalités et base légale</h2>
    <p>
      Ces données servent à fournir le jeu (création et gestion du compte, collection, échanges,
      enchères, emails de sécurité). Leur traitement repose sur l'exécution des conditions
      d'utilisation que tu acceptes en t'inscrivant ; la limitation des tentatives de connexion
      repose sur l'intérêt légitime à sécuriser le service.
    </p>

    <h2>Ce que voient les autres joueurs</h2>
    <p>
      Ton identifiant est visible des autres joueurs (échanges, enchères). Ta collection est visible
      sur ton profil, sauf si tu la rends privée dans les
      <Link route="settings" class="il">réglages</Link>. Ton adresse email, tes favoris et tes tags
      ne sont jamais montrés.
    </p>

    <h2>Destinataires</h2>
    <p>
      Les données ne sont ni vendues ni cédées. Elles sont hébergées par l'hébergeur indiqué dans
      les
      <Link route="legal.notice" class="il">mentions légales</Link>, et les emails passent par un
      prestataire d'envoi. Les appels à Wikipédia sont faits par le serveur : aucune donnée te
      concernant n'est transmise à la Wikimedia Foundation. Les polices sont servies par le site
      lui-même.
    </p>

    <h2>Durées de conservation</h2>
    <p>
      Les données de compte et de jeu sont conservées tant que le compte existe, et effacées à sa
      suppression. Les données de sécurité expirent d'elles-mêmes (quelques minutes à 24 heures).
    </p>

    <h2>Cookies</h2>
    <p>
      Le site n'utilise que des cookies strictement nécessaires : session de connexion, protection
      contre les requêtes falsifiées (CSRF) et préférence de thème clair ou sombre. Ils sont
      exemptés de consentement : aucun bandeau n'est donc affiché.
    </p>

    <h2>Tes droits</h2>
    <p>
      Tu peux accéder à tes données, les rectifier (identifiant, email, mot de passe dans les
      réglages), les effacer en supprimant ton compte, t'opposer à leur traitement, en demander la
      limitation ou la portabilité en écrivant à {{ legal.contactEmail }}. Tu peux aussi adresser
      une réclamation à la <a href="https://www.cnil.fr/fr/plaintes" class="il">CNIL</a>.
    </p>
  </LegalPage>
</template>
