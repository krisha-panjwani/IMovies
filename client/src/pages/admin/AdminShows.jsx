import { useState } from 'react'
import toast from 'react-hot-toast'
import { cinemasApi, moviesApi, showsApi } from '../../api'
import { getErrorMessage } from '../../api/http'
import useFetch from '../../hooks/useFetch'
import { EmptyState, ErrorState, PageLoader } from '../../components/States'
import { AdminHeader } from './AdminLayout'
import { dateKey, formatDateTime, formatPrice } from '../../utils/format'

const EMPTY = {
  movie: '',
  cinema: '',
  screenName: '',
  language: '',
  date: dateKey(Date.now() + 24 * 3600 * 1000),
  time: '19:00',
  classic: 200,
  prime: 250,
  recliner: 550,
}

export default function AdminShows() {
  const shows = useFetch(() => showsApi.list())
  const options = useFetch(() => Promise.all([moviesApi.list(), cinemasApi.list()]))
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const [movies, cinemas] = options.data || [[], []]
  const screens = cinemas.find((c) => c._id === form.cinema)?.screens || []
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value, ...(key === 'cinema' ? { screenName: '' } : {}) })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await showsApi.create({
        movie: form.movie,
        cinema: form.cinema,
        screenName: form.screenName,
        language: form.language.trim() || undefined,
        // The admin types an Indian time, so attach the IST offset explicitly.
        startTime: new Date(`${form.date}T${form.time}:00+05:30`).toISOString(),
        prices: { classic: Number(form.classic), prime: Number(form.prime), recliner: Number(form.recliner) },
      })
      toast.success('Show scheduled')
      setForm({ ...form, time: '' })
      shows.reload()
    } catch (err) {
      toast.error(getErrorMessage(err), { duration: 5000 })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (show) => {
    if (!window.confirm(`Delete the ${formatDateTime(show.startTime)} show of "${show.movie?.title}"?`)) return
    try {
      await showsApi.remove(show._id)
      toast.success('Show deleted')
      shows.reload()
    } catch (err) {
      toast.error(getErrorMessage(err), { duration: 5000 })
    }
  }

  return (
    <>
      <AdminHeader title="Shows" subtitle="Schedule movies on cinema screens. Overlapping shows on one screen are blocked." />

      <form className="surface p-3 mb-4" onSubmit={submit}>
        <h2 className="h6 mb-3">Schedule a show</h2>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small" htmlFor="s-movie">Movie</label>
            <select id="s-movie" className="form-select" value={form.movie} onChange={set('movie')} required>
              <option value="">Choose a movie</option>
              {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small" htmlFor="s-cinema">Cinema</label>
            <select id="s-cinema" className="form-select" value={form.cinema} onChange={set('cinema')} required>
              <option value="">Choose a cinema</option>
              {cinemas.map((c) => <option key={c._id} value={c._id}>{c.name}{c.locality ? `, ${c.locality}` : ''}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small" htmlFor="s-screen">Screen</label>
            <select id="s-screen" className="form-select" value={form.screenName} onChange={set('screenName')} required disabled={!form.cinema}>
              <option value="">Choose a screen</option>
              {screens.map((s) => <option key={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small" htmlFor="s-lang">Show language</label>
            <input id="s-lang" className="form-control" placeholder="Same as movie" value={form.language} onChange={set('language')} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small" htmlFor="s-date">Date</label>
            <input id="s-date" type="date" className="form-control" min={dateKey()} value={form.date} onChange={set('date')} required />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small" htmlFor="s-time">Time (IST)</label>
            <input id="s-time" type="time" className="form-control" value={form.time} onChange={set('time')} required />
          </div>
          {['classic', 'prime', 'recliner'].map((tier) => (
            <div key={tier} className="col-4 col-md-1">
              <label className="form-label small text-capitalize" htmlFor={`s-${tier}`}>{tier} ₹</label>
              <input id={`s-${tier}`} type="number" min={0} max={5000} className="form-control" value={form[tier]} onChange={set(tier)} required />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
          {saving ? 'Scheduling…' : 'Schedule show'}
        </button>
      </form>

      {shows.loading ? (
        <PageLoader />
      ) : shows.error ? (
        <ErrorState message={shows.error} onRetry={shows.reload} />
      ) : shows.data.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="No upcoming shows" message="Schedule a show using the form above." />
      ) : (
        <div className="surface p-2 table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>When</th>
                <th>Movie</th>
                <th>Cinema · Screen</th>
                <th>Sold</th>
                <th>From</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.data.map((show) => (
                <tr key={show._id}>
                  <td className="text-nowrap small">{formatDateTime(show.startTime)}</td>
                  <td>
                    {show.movie?.title}
                    {show.language && <div className="small text-muted-im">{show.language}</div>}
                  </td>
                  <td className="small">{show.cinema?.name} · {show.screenName}</td>
                  <td className="small">{show.totalSeats - show.seatsLeft}/{show.totalSeats}</td>
                  <td className="small">{formatPrice(show.prices.classic)}</td>
                  <td className="text-end">
                    <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => remove(show)} aria-label="Delete show">
                      <i className="bi bi-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
