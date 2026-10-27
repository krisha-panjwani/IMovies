const test = require('node:test');
const assert = require('node:assert/strict');
const moods = require('../services/cinemood/moods');
const { scoreMovie, recommend } = require('../services/cinemood/engine');

const mood = (id) => moods.find((m) => m.id === id);

const comedy = {
  _id: 'm1',
  title: 'Hostel Hijinks',
  genres: ['Comedy'],
  moodTags: ['funny', 'lighthearted'],
  synopsis: 'A hilarious misadventure.',
  certificate: 'UA',
  rating: 6.9,
};
const thriller = {
  _id: 'm2',
  title: 'The Last Signal',
  genres: ['Thriller', 'Mystery', 'Sci-Fi'],
  moodTags: ['twisty', 'mind-bending'],
  synopsis: 'She must uncover the truth.',
  certificate: 'UA',
  rating: 8.4,
};
const darkCrime = {
  _id: 'm3',
  title: 'Midnight',
  genres: ['Crime', 'Comedy'],
  moodTags: ['dark'],
  synopsis: 'A crime story.',
  certificate: 'A',
  rating: 9,
};

test('comedy scores for Good Laugh with readable reasons', () => {
  const result = scoreMovie(comedy, mood('good-laugh'));
  // Comedy genre (3) + two tags (8) + two keywords (capped at 2) = 13
  assert.equal(result.score, 13);
  assert.ok(result.reasons.some((r) => r.includes('Comedy')));
  assert.ok(result.reasons.some((r) => r.includes('"funny"')));
});

test('an unrelated movie is not recommended', () => {
  assert.equal(scoreMovie(thriller, mood('good-laugh')), null);
});

test('excluded tags remove a movie even if its genre matches', () => {
  assert.equal(scoreMovie(darkCrime, mood('good-laugh')), null);
});

test('an upcoming show adds a bonus and a reason', () => {
  const nextShow = { startTime: new Date(Date.now() + 3_600_000) };
  const without = scoreMovie(thriller, mood('plot-twist'));
  const withShow = scoreMovie(thriller, mood('plot-twist'), nextShow);
  assert.equal(withShow.score, without.score + 2);
  assert.ok(withShow.reasons.some((r) => r.startsWith('Next show')));
});

test('a show alone never makes an unrelated movie a match', () => {
  const nextShow = { startTime: new Date(Date.now() + 3_600_000) };
  assert.equal(scoreMovie(thriller, mood('cozy-night'), nextShow), null);
});

test('recommend ranks by score and returns an empty list when nothing matches', () => {
  const ranked = recommend([comedy, thriller], mood('plot-twist'));
  assert.deepEqual(ranked.map((r) => r.movie.title), ['The Last Signal']);
  assert.deepEqual(recommend([darkCrime], mood('cozy-night')), []);
});

test('every mood is well formed', () => {
  for (const m of moods) {
    assert.ok(m.id && m.name && m.primaryGenres.length && m.tags.length, `mood ${m.id} is incomplete`);
    assert.ok(Array.isArray(m.exclude.tags) && Array.isArray(m.exclude.certificates));
  }
});
