const { google } = require("googleapis");
const scopes = ["https://www.googleapis.com/auth/drive.readonly"];

const jwt = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, "base64")
    .toString("utf8")
    .replace(/\\n/g, "\n"),
  scopes,
});

async function getAuthentication() {
  return jwt;
}

exports.getAuthentication = getAuthentication;
