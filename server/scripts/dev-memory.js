// Runs the API against a temporary in-memory MongoDB, filled with demo data.
// Handy for trying IMovies before MongoDB Atlas is set up:  npm run dev:demo
// Everything is lost when you stop the server.

require('dotenv').config({ quiet: true, path: require('path').join(__dirname, '..', '.env') });

const crypto = require('crypto');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  console.log('Starting in-memory MongoDB (the first run downloads it, which can take a minute)...');
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('imovies');
  process.env.JWT_SECRET ||= crypto.randomBytes(32).toString('hex');

  const app = require('../app');
  const seed = require('../seed/seed');

  await mongoose.connect(process.env.MONGODB_URI);
  await seed();

  const port = process.env.PORT || 8000;
  app.listen(port, () => console.log(`IMovies API (in-memory demo DB) running at http://localhost:${port}/api`));

  const shutdown = async () => {
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
