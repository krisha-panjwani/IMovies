// Movie catalogue for IMovies (Indore).
//
// Real films. Facts and posters were checked on 25 October 2026:
// - Title, director, cast, language, runtime, release date and poster come from
//   each film's own English Wikipedia article (infobox + lead). The poster URL is
//   the file named in that article's infobox, so title and poster always match.
// - "Now showing" films were cross-checked against Indore cinema listings on
//   District (district.in), and certificates are the CBFC ratings shown there.
// - Synopses are short factual summaries written for IMovies from those sources.
// - Ratings are deliberately left empty: we have no reliable source for them.
// - moodTags are IMovies' own editorial tags (used by CineMood), chosen from
//   each film's described genre. They are not official data.
//
// Posters are copyright of their respective studios and are shown here for a
// non-commercial student project, linked from Wikimedia's servers.

const WIKI = 'https://en.wikipedia.org/wiki/';
const POSTER = 'https://upload.wikimedia.org/wikipedia/en/';

module.exports = [
  // ---------- Now showing in Indore ----------
  {
    title: 'Drishyam: The Conclusion',
    synopsis:
      'The third and final chapter of the Hindi Drishyam crime-thriller series and the sequel to Drishyam 2 (2022), with Ajay Devgn back as Vijay Salgaonkar. It tells an original story, separate from the Malayalam films of the franchise.',
    genres: ['Crime', 'Thriller', 'Drama'],
    language: 'Hindi',
    durationMins: 150,
    certificate: 'UA16+',
    releaseDate: '2026-10-02',
    director: 'Abhishek Pathak',
    cast: ['Ajay Devgn', 'Tabu', 'Shriya Saran', 'Jaideep Ahlawat'],
    posterUrl: `${POSTER}d/d9/Drishyam-_The_Conclusion_poster.jpg`,
    sourceUrl: `${WIKI}Drishyam:_The_Conclusion`,
    moodTags: ['twisty', 'suspenseful'],
  },
  {
    title: 'Udta Teer',
    synopsis:
      'A Hindi spy comedy marking the directorial debut of Aakash Kaushik, starring Ayushmann Khurrana and Sara Ali Khan with Rahul Bose, Ram Kapoor and Gulshan Grover. Produced by Dharma Productions and Sikhya Entertainment.',
    genres: ['Comedy', 'Spy'],
    language: 'Hindi',
    durationMins: 134,
    certificate: 'UA13+',
    releaseDate: '2026-10-23',
    director: 'Aakash Kaushik',
    cast: ['Ayushmann Khurrana', 'Sara Ali Khan', 'Rahul Bose', 'Ram Kapoor'],
    posterUrl: `${POSTER}c/c8/Udta_Teer_film_poster.jpg`,
    sourceUrl: `${WIKI}Udta_Teer`,
    moodTags: ['funny', 'lighthearted'],
  },
  {
    title: 'Prahaar: The Untold Story of Ujjwal Nikam',
    synopsis:
      'A Hindi legal drama about public prosecutor Ujjwal Nikam and his role in the court cases that followed the 1993 Bombay bombings and the 2008 Mumbai attacks. Rajkummar Rao plays Nikam.',
    genres: ['Drama', 'Biography'],
    language: 'Hindi',
    durationMins: 140,
    certificate: 'UA16+',
    releaseDate: '2026-10-16',
    director: 'Avinash Arun',
    cast: ['Rajkummar Rao', 'Wamiqa Gabbi', 'Jaideep Ahlawat', 'Sikandar Kher'],
    posterUrl: `${POSTER}a/a0/Prahaar-_The_Untold_Story_of_Ujjwal_Nikam_film_poster.jpg`,
    sourceUrl: `${WIKI}Prahaar:_The_Untold_Story_of_Ujjwal_Nikam`,
    moodTags: ['inspiring', 'emotional', 'suspenseful'],
  },
  {
    title: 'Nayyi Navelli',
    synopsis:
      'A Hindi comedy horror film directed by Balaji Mohan and written by Himanshu Sharma and Divy Nidhi Sharma, starring Yami Gautam and Adinath Kothare.',
    genres: ['Comedy', 'Horror'],
    language: 'Hindi',
    durationMins: 135,
    certificate: 'UA16+',
    releaseDate: '2026-10-16',
    director: 'Balaji Mohan',
    cast: ['Yami Gautam', 'Adinath Kothare'],
    posterUrl: `${POSTER}e/e3/Nayyi_Navelli_Poster.jpg`,
    sourceUrl: `${WIKI}Nayyi_Navelli`,
    moodTags: ['funny', 'lighthearted'],
  },
  {
    title: 'Clayface',
    synopsis:
      'A DC Studios body-horror psychological thriller. After a mobster disfigures him, Matt Hagen turns to a scientist whose treatment turns his body into clay, and his hunt for revenge slowly costs him his sense of who he is.',
    genres: ['Horror', 'Thriller'],
    language: 'English',
    durationMins: 108,
    certificate: 'A',
    // United States release date (Wikipedia lists no separate India date).
    releaseDate: '2026-10-23',
    director: 'James Watkins',
    cast: ['Tom Rhys Harries', 'Naomi Ackie', 'David Dencik', 'Max Minghella'],
    posterUrl: `${POSTER}4/4f/Clayface_%28film%29_poster.jpg`,
    sourceUrl: `${WIKI}Clayface_(film)`,
    moodTags: ['dark', 'suspenseful', 'mind-bending'],
  },
  {
    title: 'Street Fighter',
    synopsis:
      'The third live-action film based on the Street Fighter video games. Martial artist Chun-Li brings together Ryu and Ken Masters for a fighting tournament and a showdown with the dictator M. Bison.',
    genres: ['Action'],
    language: 'English',
    durationMins: 120,
    certificate: 'UA16+',
    // United States release date (Wikipedia lists no separate India date).
    releaseDate: '2026-10-16',
    director: 'Kitao Sakurai',
    cast: ['Noah Centineo', 'Andrew Koji', 'Callina Liang', 'Roman Reigns'],
    posterUrl: `${POSTER}d/d4/Street_Fighter_2026_film_poster.jpeg`,
    sourceUrl: `${WIKI}Street_Fighter_(2026_film)`,
    moodTags: ['high-octane', 'action-packed'],
  },
  {
    title: 'Jailer 2',
    synopsis:
      'Rajinikanth returns in this action comedy sequel to Jailer (2023), written and directed by Nelson Dilipkumar and produced by Kalanithi Maran under Sun Pictures. Shown in Indore in its Hindi version.',
    genres: ['Action', 'Comedy'],
    language: 'Tamil',
    durationMins: 165,
    certificate: 'UA16+',
    releaseDate: '2026-10-15',
    director: 'Nelson Dilipkumar',
    cast: ['Rajinikanth', 'S. J. Suryah', 'Mithun Chakraborty', 'Suraj Venjaramoodu'],
    posterUrl: `${POSTER}d/dc/Jailer_2_poster.jpg`,
    sourceUrl: `${WIKI}Jailer_2`,
    moodTags: ['action-packed', 'high-octane', 'funny'],
  },
  {
    title: 'Hanuman Ansh',
    synopsis:
      'A Hindi biographical film about the early life of Neem Karoli Baba: young Lakshmi Narayan loses his mother in pre-Independence India and sets out in search of God. The first part of a planned trilogy, based on Vishal Chaturvedi\'s book Divine Detour.',
    genres: ['Biography', 'Devotional'],
    language: 'Hindi',
    durationMins: 150,
    certificate: 'U',
    releaseDate: '2026-08-07',
    director: 'Vishal Chaturvedi',
    cast: ['Shobhinaw Satyaa', 'Chandan Anand', 'Purnima Tiwari', 'Vihaan Shedge'],
    posterUrl: `${POSTER}0/0e/Official_poster_for_the_Hanuman_Ansh_%282026%29_film.jpg`,
    sourceUrl: `${WIKI}Hanuman_Ansh`,
    moodTags: ['inspiring', 'heartfelt', 'family-friendly'],
  },

  // ---------- Coming soon (announced release dates; runtime and certificate not yet published) ----------
  {
    title: 'Ramayana: Part 1',
    synopsis:
      'Nitesh Tiwari\'s epic mythological adaptation of Valmiki\'s Ramayana, following the life and trials of Prince Rama. The first of a two-part series.',
    genres: ['Mythology', 'Fantasy'],
    language: 'Hindi',
    releaseDate: '2026-11-05',
    director: 'Nitesh Tiwari',
    cast: ['Ranbir Kapoor', 'Yash', 'Sai Pallavi', 'Ravi Dubey'],
    posterUrl: `${POSTER}4/48/Ramayana_Part_1_%28poster%29.jpg`,
    sourceUrl: `${WIKI}Ramayana:_Part_1`,
    moodTags: ['epic', 'family-friendly'],
  },
  {
    title: 'Eetha',
    synopsis:
      'A Hindi biographical film about the Tamasha and Lavani artist Vithabai Bhau Mang Narayangaonkar, played by Shraddha Kapoor.',
    genres: ['Biography'],
    language: 'Hindi',
    releaseDate: '2026-12-04',
    director: 'Laxman Utekar',
    cast: ['Shraddha Kapoor', 'Randeep Hooda', 'Mohammed Zeeshan Ayyub'],
    posterUrl: `${POSTER}3/31/Eetha_poster.jpg`,
    sourceUrl: `${WIKI}Eetha`,
    moodTags: ['inspiring', 'emotional'],
  },
  {
    title: 'King',
    synopsis:
      'An upcoming Hindi action thriller directed by Siddharth Anand, shot in Mumbai, Cape Town, Warsaw and Gdańsk.',
    genres: ['Action', 'Thriller'],
    language: 'Hindi',
    releaseDate: '2026-12-24',
    director: 'Siddharth Anand',
    cast: ['Shah Rukh Khan', 'Suhana Khan', 'Abhishek Bachchan', 'Deepika Padukone'],
    posterUrl: `${POSTER}f/fd/King_%28Hindi_film%29.jpg`,
    sourceUrl: `${WIKI}King_(2026_film)`,
    moodTags: ['action-packed', 'high-octane'],
  },
].map((movie) => ({ sourceName: 'Wikipedia', ...movie, releaseDate: new Date(`${movie.releaseDate}T00:00:00+05:30`) }));
