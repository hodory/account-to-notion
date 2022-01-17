const { default: axios } = require("axios");
const { apiKey: googleDriveApiKey } = require("../google/drive");

const apiUrl = process.env.NAVER_OCR_API_URL;
const apiKey = process.env.NAVER_OCR_API_KEY;
const config = {
  headers: {
    "Content-Type": "application/json",
    "X-OCR-SECRET": apiKey,
  },
};

async function getOCRData(encodedFile) {
  const data = {
    images: [
      {
        format: "png",
        name: "medium",
        data: encodedFile,
      },
    ],
    lang: "ko",
    requestId: "string",
    resultType: "string",
    timestamp: new Date().getTime(),
    version: "V1",
  };

  try {
    const result = await axios.post(`${apiUrl}`, data, config);
    return result;
  } catch (error) {
    console.log("============ Naver OCR request failed ============");
    console.log(error);
    return null;
  }
}

exports.getOCRData = getOCRData;
