import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import { cinemasApi } from '../../api'
import { getErrorMessage } from '../../api/http'
import useFetch from '../../hooks/useFetch'
import { EmptyState, ErrorState, PageLoader } from '../../components/States'
import { AdminHeader } from './AdminLayout'
import { TIER_LABELS } from '../../utils/format'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const newScreen = (n) => ({ name: `Screen ${n}`, classicRows: 4, primeRows: 4, reclinerRows: 2, seatsPerRow: 12, reclinerSeats: 8 })

// Turns "4 classic rows, 4 prime rows, 2 recliner rows" into rows A..J.
function buildRows(screen) {
  const tiers = [
    ...Array(Number(screen.classicRows)).fill(['classic', screen.seatsPerRow]),
    ...Array(Number(screen.primeRows)).fill(['prime', screen.seatsPerRow]),
    ...Array(Number(screen.reclinerRows)).fill(['recliner', screen.reclinerSeats]),
  ]
  return tiers.map(([tier, seats], i) => ({ label: LETTERS[i], tier, seats: Number(seats) }))
}

function CinemaForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ name: '', brand: '', locality: '', city: 'Indore', state: 'Madhya Pradesh', address: '' })
  const [screens, setScreens] = useState([newScreen(1)])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateScreen = (index, key, value) => setScreens(screens.map((s, i) => (i === index ? { ...s, [key]: value } : s)))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const built = screens.map((s) => ({ name: s.name.trim(), rows: buildRows(s) }))
    if (built.some((s) => s.rows.length === 0 || s.rows.length > 26)) {
      setError('Each screen needs between 1 and 26 rows')
      return
    }
    setSaving(true)
    try {
      await cinemasApi.create({ ...form, screens: built })
      toast.success('Cinema added')
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <Modal.Body className="d-grid gap-3">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="c-name">Cinema name</label>
            <input id="c-name" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="c-brand">Brand (e.g. PVR, INOX)</label>
            <input id="c-brand" className="form-control" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="c-locality">Locality / area</label>
            <input id="c-locality" className="form-control" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="c-city">City</label>
            <input id="c-city" className="form-control" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="c-state">State</label>
            <input id="c-state" className="form-control" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="c-address">Address</label>
          <input id="c-address" className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </div>

        {screens.map((screen, i) => (
          <div key={i} className="surface p-3" style={{ background: 'var(--im-surface-2)' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <input className="form-control form-control-sm w-auto fw-semibold" value={screen.name} aria-label="Screen name" onChange={(e) => updateScreen(i, 'name', e.target.value)} required />
              {screens.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => setScreens(screens.filter((_, j) => j !== i))}>
                  Remove
                </button>
              )}
            </div>
            <div className="row g-2">
              {[
                ['classicRows', 'Classic rows'],
                ['primeRows', 'Prime rows'],
                ['reclinerRows', 'Recliner rows'],
                ['seatsPerRow', 'Seats per row'],
                ['reclinerSeats', 'Recliner seats/row'],
              ].map(([key, label]) => (
                <div key={key} className="col-6 col-md">
                  <label className="form-label small" htmlFor={`${key}-${i}`}>{label}</label>
                  <input id={`${key}-${i}`} type="number" min={key.endsWith('Rows') ? 0 : 1} max={30} className="form-control form-control-sm" value={screen[key]} onChange={(e) => updateScreen(i, key, e.target.value)} required />
                </div>
              ))}
            </div>
            <div className="small text-muted-im mt-2">
              {buildRows(screen).length} rows · {buildRows(screen).reduce((sum, r) => sum + r.seats, 0)} seats
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline-light btn-sm justify-self-start" onClick={() => setScreens([...screens, newScreen(screens.length + 1)])}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Add another screen
        </button>
        {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add cinema'}</button>
      </Modal.Footer>
    </form>
  )
}

export default function AdminCinemas() {
  const cinemas = useFetch(() => cinemasApi.list())
  const [adding, setAdding] = useState(false)

  return (
    <>
      <AdminHeader title="Cinemas" subtitle="Cinemas, their screens and seat layouts.">
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Add cinema
        </button>
      </AdminHeader>

      {cinemas.loading ? (
        <PageLoader />
      ) : cinemas.error ? (
        <ErrorState message={cinemas.error} onRetry={cinemas.reload} />
      ) : cinemas.data.length === 0 ? (
        <EmptyState icon="bi-building" title="No cinemas yet" message="Add a cinema before scheduling shows." />
      ) : (
        <div className="row g-3">
          {cinemas.data.map((cinema) => (
            <div key={cinema._id} className="col-md-6">
              <div className="surface p-3 h-100">
                <h2 className="h6 mb-1">
                  {cinema.name}
                  {cinema.brand && <span className="badge text-bg-dark border ms-2">{cinema.brand}</span>}
                </h2>
                <div className="small text-muted-im mb-3">
                  <i className="bi bi-geo-alt me-1" aria-hidden="true" />
                  {cinema.address}
                </div>
                {cinema.screens.map((screen) => {
                  const byTier = screen.rows.reduce((acc, r) => ({ ...acc, [r.tier]: (acc[r.tier] || 0) + r.seats }), {})
                  return (
                    <div key={screen.name} className="d-flex justify-content-between small py-1 border-top" style={{ borderColor: 'var(--im-border)' }}>
                      <span className="fw-semibold">{screen.name}</span>
                      <span className="text-muted-im">
                        {Object.entries(byTier).map(([tier, seats]) => `${seats} ${TIER_LABELS[tier]}`).join(' · ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={adding} onHide={() => setAdding(false)} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="h5">Add cinema</Modal.Title>
        </Modal.Header>
        {adding && (
          <CinemaForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false)
              cinemas.reload()
            }}
          />
        )}
      </Modal>
    </>
  )
}
