import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

// The frame around every page: navbar, the page itself, footer.
export default function AppLayout() {
  const { pathname } = useLocation()

  // Start each new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="app-shell">
      <a href="#main" className="visually-hidden-focusable btn btn-primary position-absolute m-2" style={{ zIndex: 2000 }}>
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
