<script setup lang="ts">
import AuthLayout from '~/layouts/auth.vue'
import { Form, Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <AuthLayout title="Mot de passe oublié">
    <h1 class="auth__title">Mot de passe oublié</h1>
    <p class="auth__sub">
      Indique l'adresse de ton compte : tu recevras un lien pour en choisir un nouveau.
    </p>

    <Form v-slot="{ processing, errors }" route="password_reset.store">
      <div class="auth__form">
        <div class="field">
          <label class="field__label" for="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            class="field__input"
            autocomplete="email"
            :aria-invalid="errors.email ? 'true' : 'false'"
            required
          />
          <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
        </div>
        <button type="submit" class="btn btn--primary btn--block" :disabled="processing">
          {{ processing ? 'Un instant…' : 'Envoyer le lien' }}
        </button>
      </div>
    </Form>

    <p class="auth__foot">
      <Link route="session.create" class="il">Retour à la connexion</Link>
    </p>
  </AuthLayout>
</template>
