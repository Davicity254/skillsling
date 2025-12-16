import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'

/* ---------- simple localStorage helpers ---------- */
function readProviders() {
  const raw = localStorage.getItem('skillsling_providers')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}
function saveProviders(list) {
  localStorage.setItem('skillsling_providers', JSON.stringify(list))
}
function addProvider(provider) {
  const list = readProviders()
  list.unshift(provider)
  saveProviders(list)
  return provider
}

/* ---------- Auth form (signup + login, provider multi-step) ---------- */
function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('signup')
  const [roles, setRoles] = useState({ provider: true, client: false })
  const [signupStep, setSignupStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [services, setServices] = useState([])
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const AVAILABLE_SERVICES = [
    'DJ',
    'Photographer',
    'Videographer',
    'Makeup Artist',
    'Catering',
    'PA/MC',
    'Graphic Designer'
  ]

  useEffect(() => setError(''), [mode, signupStep, name, email, password, services, bio, price])

  function toggleRole(r) {
    setRoles(prev => ({ ...prev, [r]: !prev[r] }))
  }

  function toggleService(s) {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function handleSignupStepNext() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Enter name, valid email and password (min 6 chars).')
      return
    }
    if (roles.provider) setSignupStep(2)
    else submitSignup()
  }

  function submitSignup() {
    const user = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      roles: Object.keys(roles).filter(k => roles[k]),
      provider: roles.provider ? { services, bio, price } : null
    }
    localStorage.setItem('skillsling_user', JSON.stringify(user))
    if (roles.provider) {
      // optional: persist provider profile to providers list
      addProvider({
        id: Date.now() + 1,
        ownerId: user.id,
        name: user.name,
        title: (services[0] ?? 'Service Provider'),
        bio: bio,
        price: price || 'Contact for price',
        createdAt: new Date().toISOString()
      })
    }
    onAuth?.(user)
    if (user.roles.includes('provider') && !user.roles.includes('client')) navigate('/provider')
    else if (user.roles.includes('client') && !user.roles.includes('provider')) navigate('/client')
    else navigate('/providers')
  }

  function handleLogin(e) {
    e.preventDefault()
    setError('')
    const stored = localStorage.getItem('skillsling_user')
    if (!stored) {
      setError('No account found. Please sign up.')
      return
    }
    const saved = JSON.parse(stored)
    if (saved.email === email.trim()) {
      onAuth?.(saved)
      if (saved.roles?.includes('provider') && !saved.roles.includes('client')) navigate('/provider')
      else if (saved.roles?.includes('client') && !saved.roles.includes('provider')) navigate('/client')
      else navigate('/providers')
    } else {
      setError('Incorrect email. Try signing up or use the registered email.')
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      {mode === 'login' ? (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold header-badge">Sign in</h2>
            <button onClick={() => { setMode('signup'); setSignupStep(1) }} className="text-sm text-blue-600 hover:underline">Create account</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full mt-1 px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full mt-1 px-3 py-2 border rounded" />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button type="submit" className="btn-primary w-full">Sign in</button>
            <div className="text-center text-xs text-gray-500 mt-2">Or continue as guest</div>
          </form>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-white to-slate-50 p-6 rounded-2xl shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold header-badge">Create account</h2>
            <button onClick={() => setMode('login')} className="text-sm text-blue-600 hover:underline">Have an account? Sign in</button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <label className={`px-3 py-1 rounded cursor-pointer ${roles.provider ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => toggleRole('provider')}>Service Provider</label>
              <label className={`px-3 py-1 rounded cursor-pointer ${roles.client ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => toggleRole('client')}>Client</label>
            </div>
            <p className="text-xs text-gray-500 mt-2">You can be both — select both options if you plan to offer services and hire others.</p>
          </div>

          {signupStep === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleSignupStepNext() }} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex gap-2">
                {roles.provider ? (
                  <>
                    <button type="button" onClick={() => setSignupStep(2)} className="btn-ghost flex-1">Next: Provider info</button>
                    <button type="button" onClick={submitSignup} className="btn-primary">Create account</button>
                  </>
                ) : (
                  <button type="button" onClick={submitSignup} className="btn-primary flex-1">Create account</button>
                )}
              </div>
            </form>
          )}

          {signupStep === 2 && roles.provider && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 header-badge">Provider details</h3>
              <p className="text-xs text-gray-500 mb-3">Select the services you offer and add a short bio and base price.</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {AVAILABLE_SERVICES.map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleService(s)}
                    className={`text-sm px-3 py-2 text-left rounded border ${services.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}
                  >
                    {s}
                  </ button>
                ))}
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-700">Short bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-700">Base price (e.g., Ksh 2,000)</label>
                <input value={price} onChange={e => setPrice(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

              <div className="flex gap-2">
                <button onClick={() => setSignupStep(1)} className="btn-ghost flex-1">Back</button>
                <button onClick={submitSignup} className="btn-primary">Finish & Create</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- small pages & components ---------- */
function ProvidersListPage() {
  const [list, setList] = useState([])
  useEffect(() => { setList(readProviders()) }, [])
  if (!list.length) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-700">No providers yet. Sign up as a provider to create a profile.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-4">
      {list.map(p => (
        <div key={p.id} className="bg-white p-4 rounded shadow flex items-start gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">{p.name?.[0] ?? 'P'}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.title}</h3>
              <span className="text-sm text-gray-600">{p.price}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{p.bio}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProviderCreatePage({ user }) {
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !price.trim()) { setError('Add a title and price'); return }
    const provider = {
      id: Date.now(),
      ownerId: user?.id,
      name: user?.name,
      title: title.trim(),
      bio: bio.trim(),
      price: price.trim(),
      createdAt: new Date().toISOString()
    }
    addProvider(provider)
    navigate('/providers')
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 header-badge">Create your provider profile</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Service title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Short bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Price (e.g., Ksh 2,000)</label>
            <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <button className="btn-primary w-full">Save profile</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProviderDashboardPage({ user }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-4 header-badge">Provider Dashboard</h2>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-700">Welcome, {user?.name}. Create and manage your provider profile from the "Create Profile" link.</p>
      </div>
    </div>
  )
}

function ClientDashboardPage({ user }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-4 header-badge">Client Dashboard</h2>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-700">Welcome, {user?.name}. Browse providers and start bookings.</p>
      </div>
    </div>
  )
}

function ProfilePage({ user }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-4 header-badge">Your Profile</h2>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-700">Name: {user?.name}</p>
        <p className="text-gray-700">Email: {user?.email}</p>
        <p className="text-gray-700">Roles: {user?.roles?.join(', ')}</p>
      </div>
    </div>
  )
}

function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-4 header-badge">Search</h2>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-700">Search providers (coming soon)</p>
      </div>
    </div>
  )
}

/* ---------- Header (placed before App so it's available) ---------- */
function Header({ user, onLogout }) {
  const nav = useNavigate()
  const currentPath = window.location.pathname

  function logout() {
    localStorage.removeItem('skillsling_user')
    onLogout(null)
    nav('/auth')
  }

  const navBtnClass = (path) =>
    `nav-badge text-sm px-3 py-1 rounded-md transition font-medium ${
      currentPath === path ? 'bg-blue-600 text-white' : 'btn-ghost text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }`

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Name */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="SkillSling"
            className="w-9 h-9 rounded-full border border-gray-200 shadow-sm pulse"
          />
          <Link to="/" className="font-bold text-lg text-blue-600 tracking-tight header-badge">SkillSling</Link>
        </div>

        {/* Navigation Links - displayed as button-like items */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link to="/" className={navBtnClass('/')}>Home</Link>
          <Link to="/providers" className={navBtnClass('/providers')}>Services</Link>
          <Link to="/search" className={navBtnClass('/search')}>Search</Link>
          <Link to="/profile" className={navBtnClass('/profile')}>Profile</Link>
        </nav>

        {/* Right Side: User / Auth (buttons) */}
        <div className="flex items-center gap-3">
          {!user ? (
            <Link to="/auth" className="btn-primary text-sm px-4 py-2 rounded-md">
              Login / Sign up
            </Link>
          ) : (
            <>
              {user.roles?.includes('client') && !user.roles?.includes('provider') && (
                <Link to="/provider/create" className="btn-ghost text-sm px-3 py-1 rounded-md">
                  Become a provider
                </Link>
              )}
              <span className="text-sm text-gray-600 hidden sm:inline font-medium">{user.name}</span>
              <button onClick={logout} className="btn-ghost text-sm px-3 py-1 rounded-md">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
/* ---------- App (root) ---------- */
export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('skillsling_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  function handleAuth(u) {
    setUser(u)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={setUser} />
        <Routes>
          <Route path="/auth" element={<AuthForm onAuth={handleAuth} />} />
          <Route path="/providers" element={<ProvidersListPage />} />
          <Route path="/provider/create" element={ user && user.roles?.includes('provider') ? <ProviderCreatePage user={user} /> : <Navigate to="/auth" /> } />
          <Route path="/provider" element={ user && user.roles?.includes('provider') ? <ProviderDashboardPage user={user} /> : <Navigate to="/auth" /> } />
          <Route path="/client" element={ user && user.roles?.includes('client') ? <ClientDashboardPage user={user} /> : <Navigate to="/auth" /> } />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/" element={<Navigate to="/providers" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

