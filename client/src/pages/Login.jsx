import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/http'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // After logging in, go back to the page the user was trying to open.
  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/'

  if (user) return <Navigate to={redirectTo} replace />

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password')
      return
    }
    setSubmitting(true)
    try {
      const loggedIn = await login(form.email.trim(), form.password)
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand mb-2">
            <i className="bi bi-film" aria-hidden="true" />I<span>Movies</span>
          </div>
          <p className="small text-muted-im mb-3">IMovies - Movie ticket booking made simple</p>
          <h1 className="h4 mb-1">Welcome back</h1>
          <p className="text-muted-im small mb-0">Log in to book seats and see your tickets.</p>
        </div>

        {from && (
          <div className="demo-banner mb-3 small">
            <i className="bi bi-lock" aria-hidden="true" />
            <span>Please log in to continue booking.</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input id="email" name="email" type="email" className="form-control" autoComplete="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                autoComplete="current-password"
                value={form.password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center small text-muted-im mt-4 mb-0">
          New to IMovies?{' '}
          <Link to="/register" state={location.state}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
