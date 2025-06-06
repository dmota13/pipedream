import app from "../../stripe.app.mjs";

export default {
  key: "stripe-search-customers",
  name: "Search Customers",
  type: "action",
  version: "0.0.1",
  description: "Search customers by various attributes like email domain, created date, etc. [See the docs](https://stripe.com/docs/api/customers/search) for more information",
  props: {
    app,
    query: {
      type: "string",
      label: "Search Query",
      description: "Search query using Stripe's [search query language](https://stripe.com/docs/search#search-query-language). Example: `email~\"example.com\" AND created>1609459200`",
      optional: true,
    },
    email: {
      type: "string",
      label: "Email",
      description: "Search by customer email address (e.g.,`user@example.com`)",
      optional: true,
    },
    emailDomain: {
      type: "string",
      label: "Email Domain",
      description: "Search by email **domain** (e.g., `example.com` to find all emails from that domain)",
      optional: true,
    },
    createdAfter: {
      type: "string",
      label: "Created After",
      description: "Filter customers created after this date (format: `YYYY-MM-DD`)",
      optional: true,
    },
    createdBefore: {
      type: "string",
      label: "Created Before",
      description: "Filter customers created before this date (format: `YYYY-MM-DD`)",
      optional: true,
    },
    limit: {
      propDefinition: [
        app,
        "limit",
      ],
      description: "Maximum number of customers to return",
      default: 25,
    },
  },
  methods: {
    convertDateToTimestamp(dateStr) {
      if (!dateStr) return null;
      const date = new Date(`${dateStr}T00:00:00Z`);
      return Math.floor(date.getTime() / 1000);
    },

    buildSearchQuery() {
      const queryParts = [];

      if (this.query) {
        return this.query;
      }

      if (this.email) {
        // Escape quotes in the email value to prevent query syntax errors
        const escapedEmail = this.email.replace(/"/g, "\\\"");
        queryParts.push(`email="${escapedEmail}"`);
      }

      if (this.emailDomain) {
        // Escape quotes in the domain value to prevent query syntax errors
        const escapedDomain = this.emailDomain.replace(/"/g, "\\\"");
        queryParts.push(`email~"${escapedDomain}"`);
      }

      const afterTimestamp = this.convertDateToTimestamp(this.createdAfter);
      if (afterTimestamp) {
        queryParts.push(`created>${afterTimestamp}`);
      }

      const beforeTimestamp = this.convertDateToTimestamp(this.createdBefore);
      if (beforeTimestamp) {
        queryParts.push(`created<${beforeTimestamp}`);
      }

      return queryParts.join(" AND ");
    },
  },
  async run({ $ }) {
    const query = this.buildSearchQuery();

    if (!query) {
      throw new Error("Please provide at least one search parameter");
    }

    // Use a specific API version for search functionality
    const results = await this.app.sdk("2023-10-16").customers.search({
      query,
      limit: this.limit,
    });

    const resultCount = results.data.length;
    $.export("$summary", `Found ${resultCount} customer${resultCount === 1
      ? ""
      : "s"}`);

    return results.data;
  },
};
