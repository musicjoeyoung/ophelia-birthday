import './App.css'

import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

type FormState = 'idle' | 'loading' | 'success' | 'error'

type Deco = {
  shape: string
  color: string
  size: string
  rotation: string
  top?: string
  bottom?: string
  left?: string
  right?: string
}

const DECORATIONS: Deco[] = [
  { shape: '♥', color: '#E87BA0', size: '16px', rotation: '-15deg', top: '4%', left: '6%' },
  { shape: '✦', color: '#C4A8D4', size: '12px', rotation: '30deg', top: '8%', left: '15%' },
  { shape: '✦', color: '#F5C842', size: '14px', rotation: '15deg', top: '4%', right: '10%' },
  { shape: '♥', color: '#F0A052', size: '12px', rotation: '10deg', top: '9%', right: '5%' },
  { shape: '♥', color: '#C4A8D4', size: '15px', rotation: '-5deg', top: '20%', right: '3%' },
  { shape: '★', color: '#F0A052', size: '13px', rotation: '20deg', top: '32%', right: '5%' },
  { shape: '♥', color: '#E87BA0', size: '17px', rotation: '-20deg', top: '47%', right: '4%' },
  { shape: '✦', color: '#F0A052', size: '14px', rotation: '35deg', top: '25%', left: '4%' },
  { shape: '♥', color: '#F5C842', size: '13px', rotation: '10deg', top: '40%', left: '5%' },
  { shape: '★', color: '#C4A8D4', size: '15px', rotation: '-10deg', top: '55%', left: '3%' },
  { shape: '♥', color: '#F0A052', size: '14px', rotation: '5deg', bottom: '22%', left: '7%' },
  { shape: '★', color: '#F5C842', size: '16px', rotation: '-25deg', bottom: '16%', right: '8%' },
  { shape: '♥', color: '#C4A8D4', size: '12px', rotation: '15deg', bottom: '10%', right: '16%' },
  { shape: '♥', color: '#E87BA0', size: '13px', rotation: '-8deg', bottom: '8%', left: '20%' },
  { shape: '✦', color: '#F5C842', size: '11px', rotation: '40deg', bottom: '25%', right: '18%' },
]

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [childName, setChildName] = useState('')
  const [adultName, setAdultName] = useState('')
  const [email, setEmail] = useState('')
  const [attending, setAttending] = useState<boolean | null>(null)

  function resetForm() {
    setChildName('')
    setAdultName('')
    setEmail('')
    setAttending(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (attending === null) {
      setFormState('error')
      setErrorMsg('Please select whether you will be attending')
      return
    }
    setFormState('loading')
    setErrorMsg('')
    try {
      const res = await fetch(`${API_URL}/api/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_name: childName, adult_name: adultName, email, attending }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { message?: string }).message ?? 'Something went wrong')
      }
      setFormState('success')
      resetForm()
    } catch (err) {
      setFormState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  function closeModal() {
    setModalOpen(false)
    setFormState('idle')
    setErrorMsg('')
    resetForm()
  }

  return (
    <main className="page">
      <div aria-hidden="true">
        {DECORATIONS.map((d, i) => (
          <span
            key={i}
            className="decoration"
            style={{
              color: d.color,
              fontSize: d.size,
              top: d.top,
              bottom: d.bottom,
              left: d.left,
              right: d.right,
              transform: `rotate(${d.rotation})`,
            }}
          >
            {d.shape}
          </span>
        ))}
      </div>

      <div className="hero">
        <h2 className="vibe-title">Five is a Vibe</h2>
        <img className="rainbow-svg" src="/rainbow_converted.png" alt="" aria-hidden="true" />
      </div>

      <section className="info">
        <h1 className="birthday-title">
          Ophelia&rsquo;s 5<sup>th</sup> Birthday
        </h1>
        <div className="details">
          <p className="detail-highlight">Painting, printmaking, food, &amp; fun!</p>
          <p className="detail-highlight">11:00 am &ndash; 1:00 PM</p>
          <div className="detail-divider" />
          <p>Little Pulp</p>
          <p>8016 Cooper Avenue</p>
          <p>Glendale, NY 11385</p>
        </div>
        <button className="rsvp-btn" onClick={() => setModalOpen(true)}>
          RSVP
        </button>
      </section>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="RSVP form"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close RSVP form">
              &times;
            </button>

            {formState === 'success' ? (
              <div className="modal-success">
                <div className="success-icon">🎉</div>
                <h2>You&rsquo;re on the list!</h2>
                <p>We can&rsquo;t wait to celebrate with you!</p>
                <button className="rsvp-btn" onClick={closeModal}>Close</button>
              </div>
            ) : (
              <>
                <h2 className="modal-title">RSVP</h2>
                <p className="modal-subtitle">We&rsquo;d love to see you there!</p>
                <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label>Will you be attending?</label>
                    <div className="attending-toggle">
                      <button
                        type="button"
                        className={`attending-btn${attending === true ? ' attending-btn--yes' : ''}`}
                        onClick={() => setAttending(true)}
                        disabled={formState === 'loading'}
                      >Yes!</button>
                      <button
                        type="button"
                        className={`attending-btn${attending === false ? ' attending-btn--no' : ''}`}
                        onClick={() => setAttending(false)}
                        disabled={formState === 'loading'}
                      >No</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="rsvp-child-name">Name of child attending</label>
                    <input
                      id="rsvp-child-name"
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Name of child attending"
                      required
                      disabled={formState === 'loading'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rsvp-adult-name">Name of adult(s) attending</label>
                    <input
                      id="rsvp-adult-name"
                      type="text"
                      value={adultName}
                      onChange={(e) => setAdultName(e.target.value)}
                      placeholder="Name adult(s) attending"
                      required
                      disabled={formState === 'loading'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rsvp-email">Email</label>
                    <input
                      id="rsvp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={formState === 'loading'}
                    />
                  </div>
                  {formState === 'error' && (
                    <p className="form-error" role="alert">{errorMsg}</p>
                  )}
                  <button type="submit" className="rsvp-btn" disabled={formState === 'loading'}>
                    {formState === 'loading' ? 'Sending…' : 'Count me in!'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default App
