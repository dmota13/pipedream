import app from "../../notion_api_key.app.mjs";
import common from "@pipedream/notion/sources/updated-page/updated-page.mjs";

import { adjustPropDefinitions } from "../../common/utils.mjs";

const {
  name, description, type, ...others
} = common;
const props = adjustPropDefinitions(others.props, app);

export default {
  ...others,
  key: "notion_api_key-updated-page",
  version: "0.0.1",
  name,
  description,
  type,
  props: {
    notion: app,
    ...props,
  },
};
