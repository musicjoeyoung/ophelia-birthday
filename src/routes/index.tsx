/* @refresh reset */
import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    const [modalOpen, setModalOpen] = useState(false)
    const [formState, setFormState] = useState<FormState>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [submittedAttending, setSubmittedAttending] = useState<boolean>(true)
    const [childName, setChildName] = useState('')
    const [childCount, setChildCount] = useState<1 | 2>(1)
    const [childName2, setChildName2] = useState('')
    const [adultName, setAdultName] = useState('')
    const [adultCount, setAdultCount] = useState<1 | 2>(1)
    const [adultName2, setAdultName2] = useState('')
    const [email, setEmail] = useState('')
    const [attending, setAttending] = useState<boolean | null>(null)
    const [message, setMessage] = useState('')

    function resetForm() {
        setChildName('')
        setChildCount(1)
        setChildName2('')
        setAdultName('')
        setAdultCount(1)
        setAdultName2('')
        setEmail('')
        setAttending(null)
        setMessage('')
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
                body: JSON.stringify({
                    child_name: childName,
                    ...(attending && childCount === 2 && childName2.trim() ? { child_name_2: childName2 } : {}),
                    ...(attending ? { adult_name: adultName } : {}),
                    ...(attending && adultCount === 2 && adultName2.trim() ? { adult_name_2: adultName2 } : {}),
                    email,
                    attending,
                    ...(message.trim() ? { message } : {}),
                }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error((body as { message?: string }).message ?? 'Something went wrong')
            }
            setSubmittedAttending(attending === true)
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
                    <p className="detail-highlight">11:00 am &ndash; 1:00 pm</p>
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
                                <div className="success-icon">{submittedAttending ? '🎉' : '😢'}</div>
                                <h2>{submittedAttending ? 'You\'re on the list!' : 'We\'ll miss you!'}</h2>
                                <p>{submittedAttending ? 'We can\'t wait to celebrate with you!' : 'We\'re so sorry you can\'t make it. 💕'}</p>
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

                                    {attending === true && (
                                        <p className="rsvp-context rsvp-context--yes">
                                            So happy you can make it! Please provide these additional details.
                                        </p>
                                    )}
                                    {attending === false && (
                                        <p className="rsvp-context rsvp-context--no">
                                            So sorry you can&rsquo;t make it! We&rsquo;ll miss you. Please provide these additional details.
                                        </p>
                                    )}

                                    {attending !== null && (
                                        <>
                                            <div className="form-group">
                                                {attending && (
                                                    <select
                                                        id="rsvp-child-count"
                                                        className="form-select"
                                                        value={childCount}
                                                        onChange={(e) => setChildCount(Number(e.target.value) as 1 | 2)}
                                                        disabled={formState === 'loading'}
                                                    >
                                                        <option value={1}>1 child</option>
                                                        <option value={2}>2 children</option>
                                                    </select>
                                                )}
                                                <label htmlFor="rsvp-child-name">
                                                    {attending ? (childCount === 2 ? 'First child\'s name' : 'Name of child(ren) attending') : 'Name of invited guest'}
                                                </label>
                                                <input
                                                    id="rsvp-child-name"
                                                    type="text"
                                                    value={childName}
                                                    onChange={(e) => setChildName(e.target.value)}
                                                    placeholder="Child's name"
                                                    required
                                                    disabled={formState === 'loading'}
                                                />
                                            </div>

                                            {attending && childCount === 2 && (
                                                <div className="form-group">
                                                    <label htmlFor="rsvp-child-name-2">Second child&rsquo;s name</label>
                                                    <input
                                                        id="rsvp-child-name-2"
                                                        type="text"
                                                        value={childName2}
                                                        onChange={(e) => setChildName2(e.target.value)}
                                                        placeholder="Child's name"
                                                        disabled={formState === 'loading'}
                                                    />
                                                </div>
                                            )}

                                            {attending && (
                                                <>
                                                    <div className="form-group">
                                                        <select
                                                            id="rsvp-adult-count"
                                                            className="form-select"
                                                            value={adultCount}
                                                            onChange={(e) => setAdultCount(Number(e.target.value) as 1 | 2)}
                                                            disabled={formState === 'loading'}
                                                        >
                                                            <option value={1}>1 adult</option>
                                                            <option value={2}>2 adults</option>
                                                        </select>
                                                        <label htmlFor="rsvp-adult-name">
                                                            {adultCount === 2 ? 'First adult\'s name' : 'Name of adult(s) attending'}
                                                        </label>
                                                        <input
                                                            id="rsvp-adult-name"
                                                            type="text"
                                                            value={adultName}
                                                            onChange={(e) => setAdultName(e.target.value)}
                                                            placeholder="Adult's name"
                                                            required
                                                            disabled={formState === 'loading'}
                                                        />
                                                    </div>

                                                    {adultCount === 2 && (
                                                        <div className="form-group">
                                                            <label htmlFor="rsvp-adult-name-2">Second adult&rsquo;s name</label>
                                                            <input
                                                                id="rsvp-adult-name-2"
                                                                type="text"
                                                                value={adultName2}
                                                                onChange={(e) => setAdultName2(e.target.value)}
                                                                placeholder="Adult's name"
                                                                disabled={formState === 'loading'}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}

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
                                            <div className="form-group">
                                                <label htmlFor="rsvp-message">Leave us a message <span className="form-label-optional">(optional)</span></label>
                                                <textarea
                                                    id="rsvp-message"
                                                    className="form-textarea"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder={attending ? "Can't wait to celebrate with you! 🎉" : "We'll be thinking of you! 💕"}
                                                    rows={3}
                                                    disabled={formState === 'loading'}
                                                />
                                            </div>

                                            {formState === 'error' && (
                                                <p className="form-error" role="alert">{errorMsg}</p>
                                            )}
                                            <button type="submit" className="rsvp-btn" disabled={formState === 'loading'}>
                                                {formState === 'loading' ? 'Sending…' : attending ? 'Count me in!' : 'Send RSVP'}
                                            </button>
                                        </>
                                    )}
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}
