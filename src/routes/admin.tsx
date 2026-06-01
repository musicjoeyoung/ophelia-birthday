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
    childName2: string | null
    adultName: string
    adultName2: string | null
    email: string
    attending: boolean
    message: string | null
    createdAt: string
}

type Invitee = {
    id: number
    name: string
    email: string | null
    notes: string | null
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

    // Invite list state
    const [invitees, setInvitees] = useState<Invitee[]>([])
    const [inviteesLoading, setInviteesLoading] = useState(true)
    const [selectedInvitees, setSelectedInvitees] = useState<Set<number>>(new Set())
    const [editingInviteeId, setEditingInviteeId] = useState<number | null>(null)
    const [editName, setEditName] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [editNotes, setEditNotes] = useState('')
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newNotes, setNewNotes] = useState('')
    const [addState, setAddState] = useState<'idle' | 'saving' | 'error'>('idle')
    const [inviteExtraText, setInviteExtraText] = useState('')
    const [inviteSendState, setInviteSendState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
    const [inviteSendMsg, setInviteSendMsg] = useState('')

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

    async function fetchInvitees() {
        setInviteesLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/admin/invitees`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.status === 401) { onLogout(); return }
            const data = await res.json() as Invitee[]
            setInvitees(data)
        } finally {
            setInviteesLoading(false)
        }
    }

    useEffect(() => { fetchInvitees() }, [])

    async function handleAddInvitee(e: React.FormEvent) {
        e.preventDefault()
        if (!newName.trim()) return
        setAddState('saving')
        try {
            const res = await fetch(`${API_URL}/api/admin/invitees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() || undefined, notes: newNotes.trim() || undefined }),
            })
            if (!res.ok) throw new Error()
            setNewName('')
            setNewEmail('')
            setNewNotes('')
            setAddState('idle')
            fetchInvitees()
        } catch {
            setAddState('error')
        }
    }

    async function handleDeleteInvitee(id: number) {
        await fetch(`${API_URL}/api/admin/invitees/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        setSelectedInvitees((prev) => { const next = new Set(prev); next.delete(id); return next })
        fetchInvitees()
    }

    function startEditInvitee(inv: Invitee) {
        setEditingInviteeId(inv.id)
        setEditName(inv.name)
        setEditEmail(inv.email ?? '')
        setEditNotes(inv.notes ?? '')
    }

    async function handleSaveInvitee(id: number) {
        await fetch(`${API_URL}/api/admin/invitees/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() || null, notes: editNotes.trim() || null }),
        })
        setEditingInviteeId(null)
        fetchInvitees()
    }

    function toggleInvitee(id: number) {
        setSelectedInvitees((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function selectAllWithEmail() {
        setSelectedInvitees(new Set(invitees.filter((i) => i.email).map((i) => i.id)))
    }

    async function handleSendInvite(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedInvitees.size) return
        setInviteSendState('sending')
        setInviteSendMsg('')
        try {
            const res = await fetch(`${API_URL}/api/admin/send-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ids: Array.from(selectedInvitees), extra_text: inviteExtraText.trim() || undefined }),
            })
            const data = await res.json() as { sent: number; failed: string[]; skipped: number }
            const skipNote = data.skipped ? ` (${data.skipped} skipped — no email address)` : ''
            if (data.failed?.length) {
                setInviteSendState('error')
                setInviteSendMsg(`Sent ${data.sent}. Failed: ${data.failed.join(', ')}${skipNote}`)
            } else {
                setInviteSendState('done')
                setInviteSendMsg(`Sent to ${data.sent} ${data.sent === 1 ? 'person' : 'people'}!${skipNote} ✓`)
                setInviteExtraText('')
                setSelectedInvitees(new Set())
            }
        } catch {
            setInviteSendState('error')
            setInviteSendMsg('Something went wrong. Try again.')
        }
    }

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
            ['Child Name', 'Child 2', 'Adult Name', 'Adult 2', 'Email', 'Attending', 'Message', 'RSVP Date'],
            ...rsvps.map((r) => [
                r.childName,
                r.childName2 ?? '',
                r.adultName,
                r.adultName2 ?? '',
                r.email,
                r.attending ? 'Yes' : 'No',
                r.message ?? '',
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
                                    <th>Child(ren)</th>
                                    <th>Adult(s)</th>
                                    <th>Email</th>
                                    <th>Attending</th>
                                    <th>Message</th>
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
                                        <td>{r.childName}{r.childName2 ? ` & ${r.childName2}` : ''}</td>
                                        <td>{r.adultName}{r.adultName2 ? ` & ${r.adultName2}` : ''}</td>
                                        <td>{r.email}</td>
                                        <td>
                                            <span className={`admin-badge ${r.attending ? 'admin-badge--yes' : 'admin-badge--no'}`}>
                                                {r.attending ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="admin-table__message">
                                            {r.message
                                                ? r.message.length > 40
                                                    ? <details className="msg-details"><summary>{r.message.slice(0, 40)}…</summary>{r.message}</details>
                                                    : r.message
                                                : '—'}
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

            {/* Invite List */}
            <section className="admin-section">
                <h2 className="admin-section-title">Invite List</h2>
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Separate names by comma.</p>

                <form className="admin-invite-add-form" onSubmit={handleAddInvitee} noValidate>
                    <div className="admin-invite-add-row">
                        <input
                            type="text"
                            placeholder="Name *"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            disabled={addState === 'saving'}
                        />
                        <input
                            type="email"
                            placeholder="Email (optional)"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            disabled={addState === 'saving'}
                        />
                        <input
                            type="text"
                            placeholder="Notes (optional)"
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                            disabled={addState === 'saving'}
                        />
                        <button type="submit" className="admin-btn" disabled={!newName.trim() || addState === 'saving'}>
                            {addState === 'saving' ? 'Adding…' : 'Add'}
                        </button>
                    </div>
                    {addState === 'error' && <p className="form-error" role="alert">Failed to add. Try again.</p>}
                </form>

                {inviteesLoading ? (
                    <p className="admin-empty">Loading…</p>
                ) : invitees.length === 0 ? (
                    <p className="admin-empty">No invitees yet. Add some above.</p>
                ) : (
                    <>
                        <div className="admin-select-btns" style={{ marginBottom: '0.5rem' }}>
                            <button className="admin-btn admin-btn--sm" onClick={selectAllWithEmail}>Select all with email</button>
                            <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => setSelectedInvitees(new Set())}>Clear</button>
                        </div>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Notes</th>
                                        <th>Added</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitees.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            className={selectedInvitees.has(inv.id) ? 'admin-table__row--selected' : ''}
                                            onClick={() => editingInviteeId !== inv.id && inv.email && toggleInvitee(inv.id)}
                                            style={!inv.email && editingInviteeId !== inv.id ? { opacity: 0.6 } : editingInviteeId !== inv.id ? { cursor: 'pointer' } : {}}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInvitees.has(inv.id)}
                                                    disabled={!inv.email || editingInviteeId === inv.id}
                                                    onChange={() => toggleInvitee(inv.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            {editingInviteeId === inv.id ? (
                                                <>
                                                    <td><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%' }} /></td>
                                                    <td><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%' }} /></td>
                                                    <td><input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%' }} /></td>
                                                    <td></td>
                                                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                                                        <button className="admin-btn admin-btn--sm" onClick={() => handleSaveInvitee(inv.id)}>Save</button>
                                                        {' '}
                                                        <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => setEditingInviteeId(null)}>Cancel</button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{inv.name}</td>
                                                    <td>{inv.email ?? <span style={{ color: '#aaa' }}>—</span>}</td>
                                                    <td className="admin-table__message">{inv.notes ?? '—'}</td>
                                                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                                                        <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => startEditInvitee(inv)}>Edit</button>
                                                        {' '}
                                                        <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => handleDeleteInvitee(inv.id)}>Remove</button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <form className="admin-email-form" style={{ marginTop: '1.5rem' }} onSubmit={handleSendInvite} noValidate>
                            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#444' }}>
                                Send Invite Email
                                {selectedInvitees.size > 0 && (
                                    <span className="admin-selected-count"> — {selectedInvitees.size} selected</span>
                                )}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 1rem' }}>
                                Sends the party flyer + RSVP link. Only invitees with an email address can be selected.
                            </p>
                            <div className="form-group">
                                <label htmlFor="invite-extra">Extra message (optional)</label>
                                <textarea
                                    id="invite-extra"
                                    value={inviteExtraText}
                                    onChange={(e) => setInviteExtraText(e.target.value)}
                                    rows={3}
                                    placeholder="e.g. So excited to see you there!"
                                    disabled={inviteSendState === 'sending'}
                                />
                            </div>
                            {inviteSendState === 'done' && <p className="admin-send-ok" role="status">{inviteSendMsg}</p>}
                            {inviteSendState === 'error' && <p className="form-error" role="alert">{inviteSendMsg}</p>}
                            <button
                                type="submit"
                                className="rsvp-btn"
                                disabled={!selectedInvitees.size || inviteSendState === 'sending'}
                            >
                                {inviteSendState === 'sending'
                                    ? 'Sending…'
                                    : selectedInvitees.size
                                        ? `Send invite to ${selectedInvitees.size} ${selectedInvitees.size === 1 ? 'person' : 'people'}`
                                        : 'Select recipients above'}
                            </button>
                        </form>
                    </>
                )}
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
