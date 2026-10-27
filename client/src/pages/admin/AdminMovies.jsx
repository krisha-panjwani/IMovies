import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import { moviesApi } from '../../api'
import { getErrorMessage } from '../../api/http'
import useFetch from '../../hooks/useFetch'
import Poster from '../../components/Poster'
import { EmptyState, ErrorState, PageLoader } from '../../components/States'
import { AdminHeader } from './AdminLayout'
import { dateKey, formatDuration, formatReleaseDate, isReleased } from '../../utils/format'

const EMPTY_FORM = {
  title: '',
  synopsis: '',
  genres: [],
  language: '',
  durationMins: '',
  certificate: '',
  releaseDate: dateKey(),
  director: '',
  cast: '',
  posterUrl: '',
  trailerUrl: '',
  sourceUrl: '',
  moodTags: [],
}

const toForm = (movie) => ({
  ...EMPTY_FORM,
  ...movie,
  durationMins: movie.durationMins || '',
  certificate: movie.certificate || '',
  cast: (movie.cast || []).join(', '),
  releaseDate: dateKey(movie.releaseDate),
})

function ChipPicker({ options, value, onChange, label }) {
  const toggle = (option) => onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])
  return (
    <fieldset>
      <legend className="form-label">{label}</legend>
      <div className="d-flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="check-chip">
            <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} />
            <span className="chip">{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function MovieForm({ initial, meta, onSaved, onCancel }) {
  const [form, setForm] = useState(initial ? toForm(initial) : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.genres.length === 0) {
      setError('Choose at least one genre')
      return
    }
    const payload = {
      ...form,
      durationMins: form.durationMins === '' ? null : Number(form.durationMins),
      cast: form.cast.split(',').map((name) => name.trim()).filter(Boolean),
      releaseDate: new Date(`${form.releaseDate}T00:00:00+05:30`).toISOString(),
      sourceName: form.sourceUrl ? form.sourceName || 'Source' : '',
    }
    if (!payload.certificate) delete payload.certificate
    for (const key of ['_id', '__v', 'createdAt', 'updatedAt', 'isActive', 'backdropUrl', 'rating', 'tagline', 'inCity']) {
      delete payload[key]
    }

    setSaving(true)
    try {
      const saved = initial ? await moviesApi.update(initial._id, payload) : await moviesApi.create(payload)
      toast.success(initial ? 'Movie updated' : 'Movie added')
      onSaved(saved)
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <Modal.Body className="d-grid gap-3">
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label" htmlFor="m-title">Title</label>
            <input id="m-title" className="form-control" value={form.title} onChange={set('title')} required maxLength={150} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="m-lang">Language</label>
            <input id="m-lang" className="form-control" value={form.language} onChange={set('language')} required list="languages" />
            <datalist id="languages">
              {meta?.languages.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="m-director">Director</label>
            <input id="m-director" className="form-control" value={form.director} onChange={set('director')} maxLength={100} />
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="m-cast">Cast (comma separated)</label>
            <input id="m-cast" className="form-control" value={form.cast} onChange={set('cast')} />
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="m-synopsis">Synopsis</label>
          <textarea id="m-synopsis" className="form-control" rows={3} value={form.synopsis} onChange={set('synopsis')} required minLength={20} maxLength={1500} />
        </div>
        <div className="row g-3">
          <div className="col-6 col-md-4">
            <label className="form-label" htmlFor="m-dur">Runtime (min, if known)</label>
            <input id="m-dur" type="number" min={30} max={300} className="form-control" value={form.durationMins} onChange={set('durationMins')} />
          </div>
          <div className="col-6 col-md-4">
            <label className="form-label" htmlFor="m-cert">CBFC certificate</label>
            <select id="m-cert" className="form-select" value={form.certificate} onChange={set('certificate')}>
              <option value="">Not yet certified</option>
              {(meta?.certificates || []).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="m-release">Release date</label>
            <input id="m-release" type="date" className="form-control" value={form.releaseDate} onChange={set('releaseDate')} required />
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="m-poster">Poster image URL (optional)</label>
            <input id="m-poster" type="url" className="form-control" placeholder="https://…" value={form.posterUrl} onChange={set('posterUrl')} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="m-source">Source of details/poster (URL)</label>
            <input id="m-source" type="url" className="form-control" placeholder="https://en.wikipedia.org/wiki/…" value={form.sourceUrl} onChange={set('sourceUrl')} />
          </div>
        </div>
        <p className="small text-muted-im mb-0">
          Only use a poster that belongs to this exact film, from a source you have checked.
        </p>
        <ChipPicker label="Genres" options={meta?.genres || []} value={form.genres} onChange={(genres) => setForm({ ...form, genres })} />
        <ChipPicker label="Mood tags (used by CineMood)" options={meta?.moodTags || []} value={form.moodTags} onChange={(moodTags) => setForm({ ...form, moodTags })} />
        {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Add movie'}</button>
      </Modal.Footer>
    </form>
  )
}

export default function AdminMovies() {
  const movies = useFetch(() => moviesApi.list())
  const meta = useFetch(() => moviesApi.meta())
  const [editing, setEditing] = useState(null) // null = closed, {} = new, movie = edit

  const remove = async (movie) => {
    if (!window.confirm(`Remove "${movie.title}" from the catalogue?`)) return
    try {
      await moviesApi.remove(movie._id)
      toast.success('Movie removed')
      movies.reload()
    } catch (err) {
      toast.error(getErrorMessage(err), { duration: 5000 })
    }
  }

  return (
    <>
      <AdminHeader title="Movies" subtitle="Add, edit or remove movies in the catalogue.">
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Add movie
        </button>
      </AdminHeader>

      {movies.loading ? (
        <PageLoader />
      ) : movies.error ? (
        <ErrorState message={movies.error} onRetry={movies.reload} />
      ) : movies.data.length === 0 ? (
        <EmptyState title="No movies yet" message="Add your first movie to get started." />
      ) : (
        <div className="surface p-2 table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Language</th>
                <th>Duration</th>
                <th>Release</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.data.map((movie) => (
                <tr key={movie._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Poster movie={movie} className="thumb flex-shrink-0" />
                      <div>
                        <div className="fw-semibold">{movie.title}</div>
                        <div className="small text-muted-im">
                          {[movie.genres.join(', '), movie.certificate].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{movie.language}</td>
                  <td>{formatDuration(movie.durationMins)}</td>
                  <td>
                    {formatReleaseDate(movie.releaseDate)}
                    {!isReleased(movie) && <span className="badge bg-primary ms-2">Upcoming</span>}
                  </td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(movie)} aria-label={`Edit ${movie.title}`}>
                      <i className="bi bi-pencil" aria-hidden="true" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => remove(movie)} aria-label={`Remove ${movie.title}`}>
                      <i className="bi bi-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={Boolean(editing)} onHide={() => setEditing(null)} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="h5">{editing?._id ? 'Edit movie' : 'Add movie'}</Modal.Title>
        </Modal.Header>
        {editing && (
          <MovieForm
            initial={editing._id ? editing : null}
            meta={meta.data}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              movies.reload()
            }}
          />
        )}
      </Modal>
    </>
  )
}
