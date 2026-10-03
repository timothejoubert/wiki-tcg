<script setup lang="ts">
import LegalPage from '~/components/legal_page.vue'
import { legal } from '~/lib/legal'
</script>

<template>
  <LegalPage title="Mentions légales">
    <h2>Éditeur</h2>
    <p>
      {{ legal.site }} est édité par {{ legal.publisher }}, {{ legal.publisherStatus }}.<br />
      Contact : {{ legal.contactEmail }}
    </p>

    <h2>Directeur de la publication</h2>
    <p>{{ legal.publisher }}</p>

    <h2>Hébergement</h2>
    <p>{{ legal.host }}</p>

    <h2>Propriété intellectuelle</h2>
    <p>
      Le code et l'interface du jeu appartiennent à l'éditeur. Les contenus des cartes proviennent
      de Wikipédia et de Wikimedia Commons et restent soumis à leurs licences (notamment
      <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" class="il" rel="license"
        >CC BY-SA 4.0</a
      >) ; chaque carte renvoie vers son article source. {{ legal.site }} n'est pas affilié à la
      Wikimedia Foundation.
    </p>
  </LegalPage>
</template>
