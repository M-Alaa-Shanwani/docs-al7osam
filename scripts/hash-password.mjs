// Generate AUTH salt/hash for index.html password gate.
// Usage: node scripts/hash-password.mjs "YourNewPassword"
import crypto from "node:crypto";
const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/hash-password.mjs "YourNewPassword"');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const iters = 120000;
crypto.pbkdf2(pw, salt, iters, 32, "sha256", (err, key) => {
  if (err) throw err;
  console.log(`const AUTH={salt:"${salt.toString("hex")}",hash:"${key.toString("hex")}",iters:${iters}};`);
});
