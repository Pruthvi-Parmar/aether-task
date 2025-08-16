import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import "./App.css"

const API_BASE = "http://localhost:8001"

function App() {
  const [news, setNews] = useState([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    by: "",
    file: undefined,
  })
  const [editingId, setEditingId] = useState(null)

  // one socket instance dont need to create new socket on all render
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(API_BASE, {
      transports: ["websocket", "polling"],
    })

    const s = socketRef.current

    const handler = (payload) => {
      setNews((prev) => [payload.news, ...prev])
    }

    s.off("news:created", handler) 
    s.on("news:created", handler)

    return () => {
      s.off("news:created", handler)
      s.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [])

  async function fetchNews() {
    const { data } = await axios.get(`${API_BASE}/api/news`)
    setNews(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", form.title)
    formData.append("description", form.description)
    if (editingId) formData.append("updateBy", form.by)
    else formData.append("insertBy", form.by)
    if (form.file) formData.append("photo", form.file)

    if (editingId) {
      await axios.put(`${API_BASE}/api/news/${editingId}`, formData)
      setEditingId(null)
      await fetchNews() 
    } else {
      await axios.post(`${API_BASE}/api/news`, formData)
    }

    setForm({ title: "", description: "", by: "", file: undefined })
  }

  function startEdit(item) {
    setEditingId(item._id)
    setForm({
      title: item.title,
      description: item.description,
      by: "",
      file: undefined,
    })
  }

  return (
    <div className="container">
      <h2>News Admin</h2>

      <form onSubmit={handleSubmit} className="card">
        <div className="row">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="row">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="row">
          <label>{editingId ? "Update By" : "Insert By"}</label>
          <input value={form.by} onChange={(e) => setForm({ ...form, by: e.target.value })} required />
        </div>
        <div className="row">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] })} />
        </div>
        <button type="submit">{editingId ? "Update News" : "Create News"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setForm({
                title: "",
                description: "",
                by: "",
                file: undefined,
              })
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Listing</h3>
      <div className="list">
        {news.map((n) => (
          <div className="newsItem" key={n._id}>
            <div className="newsHeader">
              <strong>{n.title}</strong>
              <button onClick={() => startEdit(n)}>Edit</button>
            </div>
            <div>{n.description}</div>
            <div className="meta">
              <span>By: {n.insertBy}</span>
              {n.updateBy && <span> • Updated by: {n.updateBy}</span>}
              <span> • Created: {new Date(n.createdAt).toLocaleString()}</span>
              <span> • Updated: {new Date(n.updatedAt).toLocaleString()}</span>
            </div>
            {n.photoId && (
              <img src={`${API_BASE}/uploads/${n.photoId.filename}`} alt="news" style={{ maxWidth: 240 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
