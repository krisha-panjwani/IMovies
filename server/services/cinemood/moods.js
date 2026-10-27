// CineMood mood definitions. These are plain data, so you can tune a mood
// without touching the scoring code in engine.js.
//
// primaryGenres   strong signal   (+3 each)
// secondaryGenres weaker signal   (+1 each)
// tags            movie moodTags  (+4 each - hand-picked, so the most reliable)
// keywords        words searched for in the synopsis (+1 each, max +2)
// exclude         movies with any of these tags/certificates are never recommended

module.exports = [
  {
    id: 'good-laugh',
    name: 'Good Laugh',
    description: 'Comedy and lighthearted fun to brighten your day.',
    color: '#FACC15',
    icon: 'bi-emoji-laughing',
    primaryGenres: ['Comedy'],
    secondaryGenres: ['Animation', 'Family', 'Romance'],
    tags: ['funny', 'lighthearted', 'feel-good'],
    keywords: ['hilarious', 'chaos', 'prank', 'misadventure', 'comedy', 'mix-up'],
    exclude: { tags: ['dark'], certificates: [] },
  },
  {
    id: 'plot-twist',
    name: 'Mind-Blowing Plot Twist',
    description: 'Mysteries and thrillers that keep you guessing.',
    color: '#818CF8',
    icon: 'bi-lightning-charge',
    primaryGenres: ['Mystery', 'Thriller'],
    secondaryGenres: ['Crime', 'Sci-Fi'],
    tags: ['twisty', 'mind-bending', 'suspenseful'],
    keywords: ['secret', 'mystery', 'twist', 'truth', 'vanish', 'clue', 'signal'],
    exclude: { tags: [], certificates: [] },
  },
  {
    id: 'good-cry',
    name: 'Good Cry',
    description: 'Emotional, heartfelt stories that stay with you.',
    color: '#38BDF8',
    icon: 'bi-droplet',
    primaryGenres: ['Drama'],
    secondaryGenres: ['Romance', 'Biography', 'Family'],
    tags: ['emotional', 'tearjerker', 'heartfelt'],
    keywords: ['mother', 'father', 'loss', 'letters', 'memories', 'home', 'farewell'],
    exclude: { tags: [], certificates: [] },
  },
  {
    id: 'adrenaline-rush',
    name: 'Adrenaline Rush',
    description: 'High-energy action and adventure on the big screen.',
    color: '#F97316',
    icon: 'bi-fire',
    primaryGenres: ['Action', 'Adventure'],
    secondaryGenres: ['Sci-Fi', 'Thriller', 'Fantasy'],
    tags: ['high-octane', 'action-packed', 'epic'],
    keywords: ['chase', 'heist', 'battle', 'race', 'mission', 'war', 'escape'],
    exclude: { tags: [], certificates: [] },
  },
  {
    id: 'cozy-night',
    name: 'Cozy Movie Night',
    description: 'Feel-good, relaxing and comforting picks.',
    color: '#E0A872',
    icon: 'bi-cup-hot',
    primaryGenres: ['Family', 'Animation', 'Romance'],
    secondaryGenres: ['Comedy', 'Fantasy'],
    tags: ['cozy', 'comforting', 'feel-good', 'family-friendly'],
    keywords: ['friendship', 'village', 'tea', 'home', 'festival', 'together'],
    exclude: { tags: ['dark'], certificates: ['A'] },
  },
];
