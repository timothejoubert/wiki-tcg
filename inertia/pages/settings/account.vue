<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
import AppLayout from '~/layouts/app.vue'
import SettingsLayout from '~/layouts/settings.vue'

defineProps<{ email: string }>()
</script>

<template>
  <AppLayout>
    <SettingsLayout>
      <div class="account-sections">
        <Form
          v-slot="{ processing, errors }"
          route="settings.password"
          class="settings-form"
          reset-on-success
        >
          <h2 class="card-tags__title">Mot de passe</h2>
          <div class="field">
            <label class="field__label" for="pw-current">Mot de passe actuel</label>
            <input
              id="pw-current"
              name="currentPassword"
              type="password"
              class="field__input"
              autocomplete="current-password"
              :aria-invalid="errors.currentPassword ? 'true' : 'false'"
              required
            />
            <span v-if="errors.currentPassword" class="field__error">{{
              errors.currentPassword
            }}</span>
          </div>
          <div class="field">
            <label class="field__label" for="pw-new">Nouveau mot de passe</label>
            <input
              id="pw-new"
              name="password"
              type="password"
              class="field__input"
              autocomplete="new-password"
              :aria-invalid="errors.password ? 'true' : 'false'"
              required
            />
            <span v-if="errors.password" class="field__error">{{ errors.password }}</span>
          </div>
          <div class="field">
            <label class="field__label" for="pw-confirm">Confirmer</label>
            <input
              id="pw-confirm"
              name="passwordConfirmation"
              type="password"
              class="field__input"
              autocomplete="new-password"
              :aria-invalid="errors.passwordConfirmation ? 'true' : 'false'"
              required
            />
            <span v-if="errors.passwordConfirmation" class="field__error">{{
              errors.passwordConfirmation
            }}</span>
          </div>
          <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
            Changer le mot de passe
          </button>
        </Form>

        <Form
          v-slot="{ processing, errors }"
          route="settings.email"
          class="settings-form"
          reset-on-success
        >
          <h2 class="card-tags__title">Adresse email</h2>
          <p class="field__hint">
            Actuelle : {{ email }}. La nouvelle adresse sera confirmée par un lien.
          </p>
          <div class="field">
            <label class="field__label" for="email-new">Nouvelle adresse</label>
            <input
              id="email-new"
              name="email"
              type="email"
              class="field__input"
              autocomplete="email"
              :aria-invalid="errors.email ? 'true' : 'false'"
              required
            />
            <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
          </div>
          <div class="field">
            <label class="field__label" for="email-current">Mot de passe actuel</label>
            <input
              id="email-current"
              name="currentPassword"
              type="password"
              class="field__input"
              autocomplete="current-password"
              :aria-invalid="errors.currentPassword ? 'true' : 'false'"
              required
            />
            <span v-if="errors.currentPassword" class="field__error">{{
              errors.currentPassword
            }}</span>
          </div>
          <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
            Changer d'adresse
          </button>
        </Form>

        <Form
          v-slot="{ processing, errors }"
          route="settings.delete"
          class="settings-form settings-form--danger"
        >
          <h2 class="card-tags__title">Supprimer mon compte</h2>
          <p class="field__hint">
            Ta collection, tes wikis, tes tags, tes échanges et ton historique seront effacés
            définitivement. Impossible tant que tu as une vente aux enchères ou une mise en cours.
          </p>
          <div class="field">
            <label class="field__label" for="delete-current">Mot de passe actuel</label>
            <input
              id="delete-current"
              name="currentPassword"
              type="password"
              class="field__input"
              autocomplete="current-password"
              :aria-invalid="errors.currentPassword ? 'true' : 'false'"
              required
            />
            <span v-if="errors.currentPassword" class="field__error">{{
              errors.currentPassword
            }}</span>
          </div>
          <label class="field__check" for="delete-confirm">
            <input id="delete-confirm" name="confirm" type="checkbox" value="1" required />
            <span>Je comprends que la suppression est définitive.</span>
          </label>
          <span v-if="errors.confirm" class="field__error">{{ errors.confirm }}</span>
          <button
            type="submit"
            class="btn btn--secondary btn--sm settings-form__danger"
            :disabled="processing"
          >
            Supprimer définitivement
          </button>
        </Form>
      </div>
    </SettingsLayout>
  </AppLayout>
</template>
