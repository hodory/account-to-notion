const { Client } = require("@notionhq/client")
const isEmpty = require("lodash/isEmpty");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function createPages(properties, children) {
    const data = {
        parent: { database_id: databaseId },
        properties: properties,
    }

    if (!isEmpty(children)) {
        Object.assign(data, {children: [children]});
    }

    const result = await notion.pages.create(data);
    return result;
}

exports.createPages = createPages;