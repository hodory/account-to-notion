const _ = require("lodash");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
require("dayjs/locale/ko");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const mappingData = require("../../mapping.json");

const titleParagraph = {
  type: "text",
  text: {
    content: "",
  },
  annotations: {
    bold: true,
    color: "red_background",
  },
};

const valueParagraph = {
  type: "text",
  text: {
    content: "",
  },
};

let parsed = {};

function getPropertiesByMatcher(data) {
  const { matchedTemplate, fields: matchFields } = data.images[0];
  const matchedTemplateNo = matchedTemplate.id;
  const mapping = mappingData.template[matchedTemplateNo];
  console.log(matchedTemplate, matchFields, mapping);

  let properties = {};
  for (let map of mapping) {
    const {
      property_id: id,
      property_name: alias,
      property_type: type,
      mapping_fields: fields,
    } = map;
    for (let field of fields) {
      const found = _.find(matchFields, { name: field });
      if (!found) {
        continue;
      }
      let { name, inferText: value } = found;

      if (value === "메모를 남겨보세요") {
        value = "";
      }

      const propertiesObject = getPropertiesByType(type, value);

      parsed[alias] = value;

      if (!propertiesObject) {
        continue;
      }

      if (typeof properties[id] === "undefined") {
        properties[id] = {};
      }

      // Array Type의 데이터는 템플릿간 병합처리
      if (
        typeof properties[id][type] !== "undefined" &&
        _.isArray(properties[id][type])
      ) {
        properties[id][type] = _.unionWith(
          properties[id][type],
          getPropertiesByType(type, " | "),
          propertiesObject
        );
      }

      properties[id][type] = propertiesObject;
    }
  }

  console.log(properties);

  return properties;
}

function getPropertiesByType(type, value) {
  switch (type) {
    case "title":
      return [{ text: { content: value } }];
    case "date":
      value = dateFormatter(value);
      return { start: value };
    case "number":
      value = value.replace(/[\-\,원]/gm, "");
      return Math.abs(value);
    case "select":
      return { name: value };
    case "rich_text":
      return [{ type: "text", text: { content: value } }];
    case "relation":
      console.error("relation은 지원하지 않는 타입입니다.");
      return null;
    case "checkbox":
      return ["T", "TRUE", "사용함"].indexOf(value.toUpperCase()) > -1;
    default:
      console.error("지원하지 않는 타입입니다.");
      return null;
  }
}

function getPageContentByData() {
  if (_.isEmpty(parsed)) {
    return null;
  }

  const result = {
    object: "block",
    type: "paragraph",
    paragraph: {
      text: [],
    },
  };

  for (const [title, value] of Object.entries(parsed)) {
    let _titleParagraph = _.cloneDeep(titleParagraph);
    let _valueParagraph = _.cloneDeep(valueParagraph);
    _titleParagraph.text.content = title;
    _valueParagraph.text.content = " - " + value + "\n";

    result.paragraph.text.push(_titleParagraph, _valueParagraph);
  }

  return result;
}

function dateFormatter(date) {
  const day = dayjs.tz(
    date.replace(/(\s*)/g, ""),
    "YYYY년MM월DD일HH:mm",
    "Asia/Seoul"
  );
  if (day.isValid() === false) {
    return dayjs().format();
  }

  return day.format();
}

exports.getPropertiesByMatcher = getPropertiesByMatcher;
exports.getPageContentByData = getPageContentByData;
