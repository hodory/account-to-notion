const { google } = require("googleapis");

const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

async function getFile(auth, fileId) {
  const drive = google.drive({
    version: "v3",
    auth,
  });

  const res = await drive.files.get(
    {
      fileId: fileId,
      alt: "media",
    },
    {
      responseType: "arraybuffer",
    }
  );

  return Buffer.from(res.data).toString("base64");
}

exports.getFile = getFile;
exports.apiKey = apiKey;
