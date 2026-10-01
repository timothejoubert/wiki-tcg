<script setup lang="ts">
import AuthLayout from '~/layouts/auth.vue'
import { Form, Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <AuthLayout title="Connexion">
    <h1 class="auth__title">Bon retour</h1>
    <p class="auth__sub">Tes boosters se sont peut-être rechargés.</p>

    <Form v-slot="{ processing, errors }" route="session.store">
      <div class="auth__form">
        <div class="field">
          <label class="field__label" for="login">Email ou identifiant</label>
          <input
            id="login"
            name="login"
            type="text"
            class="field__input"
            autocomplete="username"
            :aria-invalid="errors.login ? 'true' : 'false'"
            required
          />
          <span v-if="errors.login" class="field__error">{{ errors.login }}</span>
        </div>

        <div class="field">
          <label class="field__label" for="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            class="field__input"
            autocomplete="current-password"
            :aria-invalid="errors.password ? 'true' : 'false'"
            required
          />
          <span v-if="errors.password" class="field__error">{{ errors.password }}</span>
          <Link route="password_reset.create" class="il field__hint">Mot de passe oublié ?</Link>
        </div>

        <button type="submit" class="btn btn--primary btn--block" :disabled="processing">
          {{ processing ? 'Un instant…' : 'Se connecter' }}
        </button>
      </div>
    </Form>

    <p class="auth__foot">
      Pas encore de compte ?
      <Link route="new_account.create" class="il">Créer un compte</Link>
    </p>
  </AuthLayout>
</template>
