const dotenv = require("dotenv");
const _ = require("lodash");
dotenv.config();
const { getOCRData } = require("./lib/naver/ocr");
const { parser, client } = require("./lib/notion");
const { auth, drive } = require("./lib/google");

const [, , fileId, ...argv] = process.argv;

(async () => {
  const authentication = await auth.getAuthentication();
  const encodedFile = await drive.getFile(authentication, fileId);
  const result = await getOCRData(encodedFile);
  if (result === null) {
    console.log("Get OCR Data result null");
    return false;
  }

  const { data } = result;

  const { inferResult, message } = data.images[0];

  if (inferResult === "ERROR") {
    console.log(`Error message : ${message}`);
  }

  const properties = parser.getPropertiesByMatcher(data);
  const children = parser.getPageContentByData();

  try {
    const result = await client.createPages(properties, children);
  } catch (e) {
    console.log("============ Notion create page error ============");
    console.log(e);
  }
})();
