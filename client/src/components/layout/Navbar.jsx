import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Container, Dropdown, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { CITY } from '../../utils/city'

// Location control. Indore is the only city IMovies serves today, so the menu
// says so plainly instead of listing cities that don't work.
function CitySelector() {
  return (
    <Dropdown className="city-select">
      <Dropdown.Toggle variant="link" className="city-toggle" id="city-menu" aria-label={`City: ${CITY.name}`}>
        <i className="bi bi-geo-alt-fill" aria-hidden="true" />
        <span>{CITY.name}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="city-menu">
        <Dropdown.Header>Choose your city</Dropdown.Header>
        <Dropdown.Item active as="button" type="button">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <span>
              <strong>{CITY.name}</strong>
              <span className="d-block small opacity-75">{CITY.state}</span>
            </span>
            <i className="bi bi-check-lg" aria-hidden="true" />
          </div>
        </Dropdown.Item>
        <Dropdown.Divider />
        <div className="px-3 pb-1 small text-muted-im" style={{ maxWidth: 240 }}>
          IMovies currently serves Indore only. More cities are planned.
        </div>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default function AppNavbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')

  const close = () => setExpanded(false)

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/movies?search=${encodeURIComponent(q)}` : '/movies')
    setQuery('')
    close()
  }

  const onLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <Navbar expand="lg" sticky="top" className="im-navbar py-2" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <Link to="/" className="brand" onClick={close} aria-label="IMovies home">
            <i className="bi bi-film" aria-hidden="true" />I<span>Movies</span>
          </Link>
          <CitySelector />
        </div>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto ms-lg-3 gap-lg-1 mt-3 mt-lg-0">
            <Nav.Link as={NavLink} to="/movies" onClick={close}>
              Movies
            </Nav.Link>
            <Nav.Link as={NavLink} to="/cinemas" onClick={close}>
              Cinemas
            </Nav.Link>
            <Nav.Link as={NavLink} to="/cinemood" className="nav-cinemood" onClick={close}>
              <i className="bi bi-stars me-1" aria-hidden="true" />
              CineMood
            </Nav.Link>
            {user && (
              <Nav.Link as={NavLink} to="/my-bookings" onClick={close}>
                My bookings
              </Nav.Link>
            )}
            {user && (
              <Nav.Link as={NavLink} to="/favorites" onClick={close}>
                <i className="bi bi-heart me-1" aria-hidden="true" />
                Favourites
              </Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={NavLink} to="/admin" onClick={close}>
                Admin
              </Nav.Link>
            )}
          </Nav>

          <form className="nav-search d-flex my-3 my-lg-0 me-lg-3" role="search" onSubmit={onSearch}>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              className="form-control form-control-sm"
              type="search"
              placeholder="Search movies"
              aria-label="Search movies"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          {user ? (
            <NavDropdown
              align="end"
              title={
                <span>
                  <i className="bi bi-person-circle me-2" aria-hidden="true" />
                  {user.name.split(' ')[0]}
                </span>
              }
              id="user-menu"
            >
              <NavDropdown.Header>{user.email}</NavDropdown.Header>
              <NavDropdown.Item as={Link} to="/my-bookings" onClick={close}>
                <i className="bi bi-ticket-perforated me-2" aria-hidden="true" />
                My bookings
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/favorites" onClick={close}>
                <i className="bi bi-heart me-2" aria-hidden="true" />
                My favourites
              </NavDropdown.Item>
              {isAdmin && (
                <NavDropdown.Item as={Link} to="/admin" onClick={close}>
                  <i className="bi bi-speedometer2 me-2" aria-hidden="true" />
                  Admin panel
                </NavDropdown.Item>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                Log out
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <div className="d-flex gap-2 pb-3 pb-lg-0">
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm px-3" onClick={close}>
                Sign up
              </Link>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
