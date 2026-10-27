import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/http'

// Mirrors the server's rules so users get instant feedback.
// The server still validates everything - this is only for convenience.
function validate({ name, email, password, confirm }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters)'
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address'
  if (password.length < 8) errors.password = 'Use at least 8 characters'
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Include at least one letter and one number'
  if (confirm !== password) errors.confirm = 'Passwords do not match'
  return errors
}

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/'

  if (user) return <Navigate to={redirectTo} replace />

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      const created = await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success(`Welcome to IMovies, ${created.name.split(' ')[0]}!`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const fieldErrors = err.response?.data?.errors
      if (Array.isArray(fieldErrors)) {
        setErrors(Object.fromEntries(fieldErrors.map((f) => [f.field, f.message])))
      }
      setServerError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  const field = (name, label, type = 'text', autoComplete) => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={form[name]}
        onChange={onChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] && (
        <div id={`${name}-error`} className="invalid-feedback">
          {errors[name]}
        </div>
      )}
    </div>
  )

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand mb-2">
            <i className="bi bi-film" aria-hidden="true" />I<span>Movies</span>
          </div>
          <p className="small text-muted-im mb-3">IMovies - Movie ticket booking made simple</p>
          <h1 className="h4 mb-1">Create your account</h1>
          <p className="text-muted-im small mb-0">Book seats in seconds and keep all your tickets in one place.</p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {field('name', 'Full name', 'text', 'name')}
          {field('email', 'Email', 'email', 'email')}
          {field('password', 'Password', 'password', 'new-password')}
          {field('confirm', 'Confirm password', 'password', 'new-password')}
          <p className="small text-muted-im">At least 8 characters, including a letter and a number.</p>

          {serverError && (
            <div className="alert alert-danger py-2 small" role="alert">
              {serverError}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center small text-muted-im mt-4 mb-0">
          Already have an account?{' '}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
