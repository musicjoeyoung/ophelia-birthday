import { useEffect, useRef, useState } from 'react'

/* @refresh reset */
import { createFileRoute } from '@tanstack/react-router'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'admin_token'

export const Route = createFileRoute('/admin')({
    component: AdminPage,
})

type Rsvp = {
    id: number
    childName: string
    adultName: string
    email: string
    attending: boolean
    createdAt: string
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })
            if (!res.ok) throw new Error('Wrong password')
            const { token } = await res.json() as { token: string }
            localStorage.setItem(TOKEN_KEY, token)
            onLogin(token)
        } catch {
            setError('Wrong password. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="page admin-login-wrap">
            <h1 className="birthday-title">Admin</h1>
            <form className="rsvp-form admin-login-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="admin-pw">Password</label>
                    <input
                        id="admin-pw"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        required
                        autoComplete="current-password"
                        disabled={loading}
                    />
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button type="submit" className="rsvp-btn" disabled={loading}>
                    {loading ? 'Checking…' : 'Log in'}
                </button>
            </form>
        </main>
    )
}

// ── Admin dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
    const [rsvps, setRsvps] = useState<Rsvp[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [sendState, setSendState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
    const [sendMsg, setSendMsg] = useState('')
    const emailRef = useRef<HTMLTextAreaElement>(null)

    async function fetchRsvps() {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/admin/rsvps`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.status === 401) { onLogout(); return }
            const data = await res.json() as Rsvp[]
            setRsvps(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchRsvps() }, [])

    function toggleOne(email: string) {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(email) ? next.delete(email) : next.add(email)
            return next
        })
    }

    function selectGroup(filter: 'all' | 'yes' | 'no') {
        const emails = rsvps
            .filter((r) => filter === 'all' || (filter === 'yes' ? r.attending : !r.attending))
            .map((r) => r.email)
        setSelected(new Set(emails))
    }

    function clearSelection() { setSelected(new Set()) }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault()
        if (!selected.size || !subject.trim() || !body.trim()) return
        setSendState('sending')
        setSendMsg('')
        try {
            const res = await fetch(`${API_URL}/api/admin/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    emails: Array.from(selected),
                    subject,
                    html: body.replace(/\n/g, '<br>'),
                }),
            })
            const data = await res.json() as { sent: number; failed: string[] }
            if (data.failed?.length) {
                setSendState('error')
                setSendMsg(`Sent ${data.sent}. Failed: ${data.failed.join(', ')}`)
            } else {
                setSendState('done')
                setSendMsg(`Sent to ${data.sent} ${data.sent === 1 ? 'person' : 'people'}! ✓`)
                setSubject('')
                setBody('')
            }
        } catch {
            setSendState('error')
            setSendMsg('Something went wrong. Try again.')
        }
    }

    function downloadCSV() {
        const rows = [
            ['Child Name', 'Adult Name', 'Email', 'Attending', 'RSVP Date'],
            ...rsvps.map((r) => [
                r.childName,
                r.adultName,
                r.email,
                r.attending ? 'Yes' : 'No',
                new Date(r.createdAt).toLocaleDateString(),
            ]),
        ]
        const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'rsvps.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    const yesCount = rsvps.filter((r) => r.attending).length
    const noCount = rsvps.filter((r) => !r.attending).length

    return (
        <main className="admin-wrap">
            <header className="admin-header">
                <h1 className="admin-title">Ophelia's Party — Admin</h1>
                <div className="admin-header-actions">
                    <button className="admin-btn admin-btn--ghost" onClick={fetchRsvps}>Refresh</button>
                    <button className="admin-btn admin-btn--ghost" onClick={downloadCSV}>Download CSV</button>
                    <button className="admin-btn admin-btn--ghost" onClick={onLogout}>Log out</button>
                </div>
            </header>

            <div className="admin-stats">
                <div className="admin-stat"><span className="admin-stat__num">{rsvps.length}</span><span>Total RSVPs</span></div>
                <div className="admin-stat admin-stat--yes"><span className="admin-stat__num">{yesCount}</span><span>Attending</span></div>
                <div className="admin-stat admin-stat--no"><span className="admin-stat__num">{noCount}</span><span>Not Attending</span></div>
            </div>

            {/* RSVP Table */}
            <section className="admin-section">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">Guest List</h2>
                    <div className="admin-select-btns">
                        <button className="admin-btn admin-btn--sm" onClick={() => selectGroup('all')}>All</button>
                        <button className="admin-btn admin-btn--sm admin-btn--yes" onClick={() => selectGroup('yes')}>Attending</button>
                        <button className="admin-btn admin-btn--sm admin-btn--no" onClick={() => selectGroup('no')}>Not Attending</button>
                        <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={clearSelection}>Clear</button>
                    </div>
                </div>

                {loading ? (
                    <p className="admin-empty">Loading…</p>
                ) : rsvps.length === 0 ? (
                    <p className="admin-empty">No RSVPs yet.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Child</th>
                                    <th>Adult(s)</th>
                                    <th>Email</th>
                                    <th>Attending</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rsvps.map((r) => (
                                    <tr
                                        key={r.id}
                                        className={selected.has(r.email) ? 'admin-table__row--selected' : ''}
                                        onClick={() => toggleOne(r.email)}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selected.has(r.email)}
                                                onChange={() => toggleOne(r.email)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td>{r.childName}</td>
                                        <td>{r.adultName}</td>
                                        <td>{r.email}</td>
                                        <td>
                                            <span className={`admin-badge ${r.attending ? 'admin-badge--yes' : 'admin-badge--no'}`}>
                                                {r.attending ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Email Compose */}
            <section className="admin-section">
                <h2 className="admin-section-title">
                    Send Email
                    {selected.size > 0 && (
                        <span className="admin-selected-count"> — {selected.size} selected</span>
                    )}
                </h2>
                <form className="admin-email-form" onSubmit={handleSend} noValidate>
                    <div className="form-group">
                        <label htmlFor="email-subject">Subject</label>
                        <input
                            id="email-subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Party reminder — this Saturday!"
                            disabled={sendState === 'sending'}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email-body">Message</label>
                        <textarea
                            id="email-body"
                            ref={emailRef}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={7}
                            placeholder="Write your message here…"
                            disabled={sendState === 'sending'}
                        />
                    </div>
                    {sendState === 'done' && <p className="admin-send-ok" role="status">{sendMsg}</p>}
                    {sendState === 'error' && <p className="form-error" role="alert">{sendMsg}</p>}
                    <button
                        type="submit"
                        className="rsvp-btn"
                        disabled={!selected.size || !subject.trim() || !body.trim() || sendState === 'sending'}
                    >
                        {sendState === 'sending'
                            ? 'Sending…'
                            : selected.size
                                ? `Send to ${selected.size} ${selected.size === 1 ? 'person' : 'people'}`
                                : 'Select recipients above'}
                    </button>
                </form>
            </section>
        </main>
    )
}

// ── Page root ─────────────────────────────────────────────────────────────────
function AdminPage() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

    function handleLogin(t: string) { setToken(t) }
    function handleLogout() {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
    }

    if (!token) return <LoginForm onLogin={handleLogin} />
    return <AdminDashboard token={token} onLogout={handleLogout} />
}
