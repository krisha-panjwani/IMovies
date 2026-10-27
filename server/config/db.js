const mongoose = require('mongoose');

// Connects to MongoDB once at startup. If the connection fails we stop the
// server, because no API route can work without the database.
async function connectDB(uri) {
  if (!uri) {
    console.error('MONGODB_URI is missing. Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
  }
  if (/<[^>]+>|PASTE_PASSWORD_HERE|YOUR_PASSWORD/.test(uri)) {
    console.error(
      'MONGODB_URI in server/.env still contains a placeholder (e.g. PASTE_PASSWORD_HERE or <password>).\n' +
        'Paste your real Atlas connection string and save the file (Ctrl+S),\n' +
        'or run "npm run dev:demo" to use a temporary in-memory database instead.'
    );
    process.exit(1);
  }

  try {
    // Fail within 10 s (instead of 30 s) if Atlas is unreachable, e.g. IP not allowed.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    if (/auth/i.test(err.message)) {
      console.error('Hint: check the database username and password in MONGODB_URI (Atlas > Database Access).');
    } else if (/timed out|ENOTFOUND|selection|whitelist|IP/i.test(err.message)) {
      console.error(
        'Hint: your internet IP address is probably not allowed. In Atlas open Network Access > Add IP Address >\n' +
          '"Add Current IP Address" (or "Allow access from anywhere"). Until then you can run "npm run dev:demo".'
      );
    }
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
}

module.exports = connectDB;
