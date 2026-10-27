require('dotenv').config({ quiet: true });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

async function start() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`IMovies API running at http://localhost:${PORT}/api`);
  });
}

start();
