<script setup lang="ts">
import AuthLayout from '~/layouts/auth.vue'
import { Form, Link } from '@adonisjs/inertia/vue'

defineProps<{ token: string; valid: boolean }>()
</script>

<template>
  <AuthLayout title="Nouveau mot de passe">
    <h1 class="auth__title">Nouveau mot de passe</h1>

    <template v-if="valid">
      <Form v-slot="{ processing, errors }" route="password_reset.update" :params="{ token }">
        <div class="auth__form">
          <div class="field">
            <label class="field__label" for="password">Nouveau mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              class="field__input"
              autocomplete="new-password"
              aria-describedby="password-hint"
              :aria-invalid="errors.password ? 'true' : 'false'"
              required
            />
            <span id="password-hint" class="field__hint">8 caractères minimum</span>
            <span v-if="errors.password" class="field__error">{{ errors.password }}</span>
          </div>
          <div class="field">
            <label class="field__label" for="passwordConfirmation">Confirmer</label>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              class="field__input"
              autocomplete="new-password"
              :aria-invalid="errors.passwordConfirmation ? 'true' : 'false'"
              required
            />
            <span v-if="errors.passwordConfirmation" class="field__error">
              {{ errors.passwordConfirmation }}
            </span>
          </div>
          <button type="submit" class="btn btn--primary btn--block" :disabled="processing">
            Enregistrer
          </button>
        </div>
      </Form>
    </template>
    <template v-else>
      <p class="auth__sub">Ce lien n'est plus valable : il a expiré ou a déjà servi.</p>
      <Link route="password_reset.create" class="btn btn--primary btn--block"
        >Faire une nouvelle demande</Link
      >
    </template>
  </AuthLayout>
</template>
