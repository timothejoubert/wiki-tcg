<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
import AppLayout from '~/layouts/app.vue'
import SettingsLayout from '~/layouts/settings.vue'

defineProps<{ collectionPublic: boolean }>()
</script>

<template>
  <AppLayout>
    <SettingsLayout>
      <Form v-slot="{ processing }" route="settings.update" class="settings-form">
        <h2 class="card-tags__title">Confidentialité</h2>
        <label class="field__check" for="collectionPublic">
          <input
            id="collectionPublic"
            name="collectionPublic"
            type="checkbox"
            value="1"
            :checked="collectionPublic"
            aria-describedby="collection-public-hint"
          />
          <span>Montrer ma collection aux autres joueurs</span>
        </label>
        <p id="collection-public-hint" class="field__hint">
          Décoché, ton profil n'affiche que ton identifiant et tu n'apparais plus dans « Ils la
          possèdent ». Les échanges restent possibles avec qui connaît ton identifiant.
        </p>
        <button type="submit" class="btn btn--primary btn--sm" :disabled="processing">
          Enregistrer
        </button>
      </Form>
    </SettingsLayout>
  </AppLayout>
</template>
