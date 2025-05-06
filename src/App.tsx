import React from 'react'
import ThumbnailEditor from './components/ThumbnailEditor'

export default function App() {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Thumbnail Craft Studio</h2>
        <p>Use the controls below to upload your image, add text, and export.</p>
      </aside>

      {/* Main canvas area */}
      <main className="main">
        <ThumbnailEditor />
      </main>
    </div>
  )
}
