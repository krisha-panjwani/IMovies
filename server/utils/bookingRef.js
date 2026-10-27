const crypto = require('crypto');

// No 0/O or 1/I so references are easy to read out loud at the counter.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

// Returns a reference like "IMV-7K3Q9X".
function generateBookingRef() {
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length];
  return `IMV-${code}`;
}

module.exports = generateBookingRef;
