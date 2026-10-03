<script setup lang="ts">
import AuthLayout from '~/layouts/auth.vue'
import { Form, Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <AuthLayout title="Inscription">
    <h1 class="auth__title">Créer un compte</h1>
    <p class="auth__sub">Trois boosters t'attendent dès ton inscription.</p>

    <Form v-slot="{ processing, errors }" route="new_account.store">
      <div class="auth__form">
        <div class="field">
          <label class="field__label" for="username">Identifiant</label>
          <input
            id="username"
            name="username"
            type="text"
            class="field__input"
            autocomplete="username"
            aria-describedby="username-hint"
            :aria-invalid="errors.username ? 'true' : 'false'"
            required
          />
          <span id="username-hint" class="field__hint"
            >3 à 32 caractères : lettres, chiffres, - et _</span
          >
          <span v-if="errors.username" class="field__error">{{ errors.username }}</span>
        </div>

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

        <div class="field">
          <label class="field__label" for="password">Mot de passe</label>
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
          <label class="field__label" for="passwordConfirmation">Confirmer le mot de passe</label>
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

        <div class="field">
          <label class="field__check" for="adult">
            <input id="adult" name="adult" type="checkbox" value="1" required />
            <span>
              J'ai 18 ans ou plus et j'accepte les
              <Link route="legal.terms" class="il">conditions d'utilisation</Link> et les
              <Link route="legal.rules" class="il">règles de la communauté</Link>. Mes données sont
              traitées selon la
              <Link route="legal.privacy" class="il">politique de confidentialité</Link>.
            </span>
          </label>
          <span v-if="errors.adult" class="field__error">{{ errors.adult }}</span>
        </div>

        <button type="submit" class="btn btn--primary btn--block" :disabled="processing">
          {{ processing ? 'Un instant…' : 'Créer mon compte' }}
        </button>
      </div>
    </Form>

    <p class="auth__foot">
      Déjà inscrit ?
      <Link route="session.create" class="il">Se connecter</Link>
    </p>
  </AuthLayout>
</template>
