/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * French error messages, the UI language.
 */
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire.',
  'string': 'Ce champ doit être un texte.',
  'email': 'Adresse email invalide.',
  'minLength': 'Au moins {{ min }} caractères.',
  'maxLength': 'Au plus {{ max }} caractères.',
  'regex': 'Format invalide.',
  'database.unique': 'Déjà utilisé par un autre compte.',
  'sameAs': 'Les mots de passe ne correspondent pas.',
  'accepted': 'Tu dois confirmer avoir 18 ans et accepter les conditions.',
  'enum': 'Valeur invalide.',
  'number': 'Ce champ doit être un nombre.',
  'boolean': 'Valeur invalide.',
})
