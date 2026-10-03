<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'
import LegalPage from '~/components/legal_page.vue'
import { legal } from '~/lib/legal'
</script>

<template>
  <LegalPage title="Conditions d'utilisation">
    <p>
      Les présentes conditions encadrent l'utilisation de {{ legal.site }}, un jeu gratuit de cartes
      à collectionner édité par {{ legal.publisher }} ({{ legal.publisherStatus }}). Créer un compte
      vaut acceptation de ces conditions et des
      <Link route="legal.rules" class="il">règles de la communauté</Link>.
    </p>

    <h2>1. Le jeu</h2>
    <p>
      Chaque carte reprend un article de la Wikipédia francophone, tiré au hasard. Sa rareté dépend
      du nombre de lecteurs de l'article. Le joueur reçoit des boosters à intervalles réguliers,
      peut collectionner, échanger, vendre aux enchères ou revendre ses cartes contre des « wikis ».
    </p>

    <h2>2. Accès et compte</h2>
    <ul>
      <li>
        Le jeu est réservé aux personnes <strong>majeures</strong> : les articles tirés au hasard
        peuvent traiter de sujets sensibles (violence, sexualité, maladies, faits historiques).
      </li>
      <li>Un compte par personne. L'identifiant ne doit pas usurper l'identité d'autrui.</li>
      <li>
        Tu es responsable de la confidentialité de ton mot de passe et de l'activité de ton compte.
      </li>
      <li>
        Tu peux supprimer ton compte à tout moment depuis les réglages ; la suppression est
        définitive et efface ta collection, tes wikis et ton historique.
      </li>
    </ul>

    <h2>3. Monnaie et cartes virtuelles</h2>
    <p>
      Les wikis et les cartes n'ont <strong>aucune valeur monétaire</strong>. Ils ne s'achètent pas
      avec de l'argent réel, ne se convertissent pas en argent et ne peuvent pas être vendus en
      dehors du jeu. L'éditeur peut ajuster les règles du jeu (taux d'apparition, prix, bonus) pour
      préserver son équilibre, sans indemnisation.
    </p>

    <h2>4. Contenu issu de Wikipédia</h2>
    <p>
      Les titres, descriptions et images des cartes proviennent de Wikipédia et de Wikimedia
      Commons, sous licence
      <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" class="il" rel="license"
        >Creative Commons BY-SA 4.0</a
      >
      ou sous la licence propre à chaque image. Chaque fiche de carte renvoie vers son article. Ces
      contenus ne reflètent pas les opinions de l'éditeur. {{ legal.site }} n'est pas affilié à la
      Wikimedia Foundation.
    </p>

    <h2>5. Comportements interdits et sanctions</h2>
    <p>
      En cas de manquement aux présentes conditions ou aux règles de la communauté (triche,
      automatisation, comptes multiples, harcèlement), l'éditeur peut suspendre ou supprimer le
      compte concerné, et annuler les échanges ou enchères obtenus de façon abusive.
    </p>

    <h2>6. Disponibilité et responsabilité</h2>
    <p>
      Le jeu est fourni gratuitement, « en l'état », sans garantie de disponibilité. Il peut être
      interrompu, modifié ou arrêté à tout moment. L'éditeur ne saurait être tenu responsable de la
      perte de cartes ou de wikis liée à un incident technique.
    </p>

    <h2>7. Données personnelles</h2>
    <p>
      Le traitement de tes données est décrit dans la
      <Link route="legal.privacy" class="il">politique de confidentialité</Link>.
    </p>

    <h2>8. Évolution et droit applicable</h2>
    <p>
      Ces conditions peuvent évoluer ; la version en vigueur est celle publiée sur cette page. Elles
      sont soumises au droit français. Pour toute question : {{ legal.contactEmail }}.
    </p>
  </LegalPage>
</template>
