import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().trim().toLowerCase().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(64)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  username: vine
    .string()
    .trim()
    .minLength(3)
    .maxLength(32)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .unique({ table: 'users', column: 'username' }),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
  adult: vine.accepted(),
})

/**
 * Validator to use before validating user credentials
 * during login. `login` accepts the email or the username.
 */
export const loginValidator = vine.create({
  login: vine.string().trim(),
  password: vine.string(),
})

export const forgotPasswordValidator = vine.create({
  email: email(),
})

export const resetPasswordValidator = vine.create({
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const changePasswordValidator = vine.create({
  currentPassword: vine.string(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const changeEmailValidator = vine.create({
  currentPassword: vine.string(),
  email: email(),
})

export const deleteAccountValidator = vine.create({
  currentPassword: vine.string(),
  confirm: vine.accepted(),
})
