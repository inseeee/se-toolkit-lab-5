import Dashboard from './Dashboard';
import { useState, useEffect, useReducer, FormEvent } from 'react'
import './App.css'

const STORAGE_KEY = 'api_key'

interface Item {
  id: number
  type: string
  title: string
  created_at: string
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; items: Item[] }
  | { status: 'error'; message: string }

type FetchAction =
  | { type: 'fetch_start' }
  | { type: 'fetch_success'; data: Item[] }
  | { type: 'fetch_error'; message: string }

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'fetch_start':
      return { status: 'loading' }
    case 'fetch_success':
      return { status: 'success', items: action.data }
    case 'fetch_error':
      return { status: 'error', message: action.message }
  }
}

function App() {
  const [page, setPage] = useState<'items' | 'dashboard'>('items');
  const [token, setToken] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? '',
  )
  const [fetchState, dispatch] = useReducer(fetchReducer, { status: 'idle' })

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      dispatch({ type: 'fetch_start' })
      try {
        const response = await fetch('/api/items/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        dispatch({ type: 'fetch_success', data })
      } catch (error) {
        dispatch({ type: 'fetch_error', message: String(error) })
      }
    }

    fetchData()
  }, [token])

  const handleConnect = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, token)
    // fetch будет вызван автоматически из-за изменения token
  }

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    dispatch({ type: 'fetch_success', data: [] })
  }

  if (!token) {
    return (
      <div className="login-container">
        <h1>API Token</h1>
        <p>Enter your API token to connect.</p>
        <form onSubmit={handleConnect}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
          />
          <button type="submit">Connect</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <header className="app-header">
        <h1>Learning Management Service</h1>
        <nav style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => setPage('items')}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Items
          </button>
          <button 
            onClick={() => setPage('dashboard')}
            style={{ padding: '5px 10px' }}
          >
            Dashboard
          </button>
        </nav>
        <button className="btn-disconnect" onClick={handleDisconnect}>
          Disconnect
        </button>
      </header>

      {page === 'items' ? (
        <>
          {fetchState.status === 'loading' && <p>Loading...</p>}
          {fetchState.status === 'error' && <p>Error: {fetchState.message}</p>}

          {fetchState.status === 'success' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ItemType</th>
                  <th>Title</th>
                  <th>Created at</th>
                </tr>
              </thead>
              <tbody>
                {fetchState.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.type}</td>
                    <td>{item.title}</td>
                    <td>{item.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

export default App1~import Dashboard from './Dashboard';
import { useState, useEffect, useReducer, FormEvent } from 'react'
import './App.css'

const STORAGE_KEY = 'api_key'

interface Item {
  id: number
  type: string
  title: string
  created_at: string
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; items: Item[] }
  | { status: 'error'; message: string }

type FetchAction =
  | { type: 'fetch_start' }
  | { type: 'fetch_success'; data: Item[] }
  | { type: 'fetch_error'; message: string }

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'fetch_start':
      return { status: 'loading' }
    case 'fetch_success':
      return { status: 'success', items: action.data }
    case 'fetch_error':
      return { status: 'error', message: action.message }
  }
}

function App() {
  const [page, setPage] = useState<'items' | 'dashboard'>('items');
  const [token, setToken] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? '',
  )
  const [fetchState, dispatch] = useReducer(fetchReducer, { status: 'idle' })

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      dispatch({ type: 'fetch_start' })
      try {
        const response = await fetch('/api/items/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        dispatch({ type: 'fetch_success', data })
      } catch (error) {
        dispatch({ type: 'fetch_error', message: String(error) })
      }
    }

    fetchData()
  }, [token])

  const handleConnect = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, token)
    // fetch будет вызван автоматически из-за изменения token
  }

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    dispatch({ type: 'fetch_success', data: [] })
  }

  if (!token) {
    return (
      <div className="login-container">
        <h1>API Token</h1>
        <p>Enter your API token to connect.</p>
        <form onSubmit={handleConnect}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
          />
          <button type="submit">Connect</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <header className="app-header">
        <h1>Learning Management Service</h1>
        <nav style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => setPage('items')}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Items
          </button>
          <button 
            onClick={() => setPage('dashboard')}
            style={{ padding: '5px 10px' }}
          >
            Dashboard
          </button>
        </nav>
        <button className="btn-disconnect" onClick={handleDisconnect}>
          Disconnect
        </button>
      </header>

      {page === 'items' ? (
        <>
          {fetchState.status === 'loading' && <p>Loading...</p>}
          {fetchState.status === 'error' && <p>Error: {fetchState.message}</p>}

          {fetchState.status === 'success' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ItemType</th>
                  <th>Title</th>
                  <th>Created at</th>
                </tr>
              </thead>
              <tbody>
                {fetchState.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.type}</td>
                    <td>{item.title}</td>
                    <td>{item.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

export default App
