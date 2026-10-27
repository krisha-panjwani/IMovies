import http from './http'

// Every backend endpoint the frontend uses, in one place.

export const authApi = {
  register: (data) => http.post('/auth/register', data),
  login: (data) => http.post('/auth/login', data),
  me: () => http.get('/auth/me'),
}

export const moviesApi = {
  list: (params) => http.get('/movies', { params }),
  meta: () => http.get('/movies/meta'),
  get: (id) => http.get(`/movies/${id}`),
  create: (data) => http.post('/movies', data),
  update: (id, data) => http.put(`/movies/${id}`, data),
  remove: (id) => http.delete(`/movies/${id}`),
}

export const cinemasApi = {
  list: (params) => http.get('/cinemas', { params }),
  get: (id) => http.get(`/cinemas/${id}`),
  cities: () => http.get('/cinemas/cities'),
  create: (data) => http.post('/cinemas', data),
}

export const showsApi = {
  list: (params) => http.get('/shows', { params }),
  get: (id) => http.get(`/shows/${id}`),
  create: (data) => http.post('/shows', data),
  remove: (id) => http.delete(`/shows/${id}`),
}

export const bookingsApi = {
  create: (showId, seats, paymentMethod) => http.post('/bookings', { showId, seats, paymentMethod }),
  mine: () => http.get('/bookings/me'),
  getByRef: (ref) => http.get(`/bookings/ref/${ref}`),
  cancel: (id) => http.patch(`/bookings/${id}/cancel`),
  all: () => http.get('/bookings'),
}

export const favoritesApi = {
  list: () => http.get('/favorites'),
  add: (movieId) => http.post('/favorites', { movieId }),
  remove: (movieId) => http.delete(`/favorites/${movieId}`),
}

export const cinemoodApi = {
  moods: () => http.get('/cinemood/moods'),
  recommend: (mood) => http.get('/cinemood/recommendations', { params: { mood } }),
}
