import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import CineMood from './pages/CineMood'
import Cinemas from './pages/Cinemas'
import CinemaDetails from './pages/CinemaDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import SelectSeats from './pages/SelectSeats'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import MyBookings from './pages/MyBookings'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminCinemas from './pages/admin/AdminCinemas'
import AdminShows from './pages/admin/AdminShows'
import AdminBookings from './pages/admin/AdminBookings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public pages */}
        <Route index element={<Home />} />
        <Route path="movies" element={<Movies />} />
        <Route path="movies/:id" element={<MovieDetails />} />
        <Route path="cinemas" element={<Cinemas />} />
        <Route path="cinemas/:id" element={<CinemaDetails />} />
        <Route path="cinemood" element={<CineMood />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Logged-in users only */}
        <Route element={<ProtectedRoute />}>
          <Route path="shows/:showId/seats" element={<SelectSeats />} />
          <Route path="shows/:showId/checkout" element={<Checkout />} />
          <Route path="bookings/:ref" element={<Confirmation />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>

        {/* Admins only */}
        <Route path="admin" element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="cinemas" element={<AdminCinemas />} />
            <Route path="shows" element={<AdminShows />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
