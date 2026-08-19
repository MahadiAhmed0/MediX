const { Builder } = require("selenium-webdriver");

// Base URL of the MediX Next.js frontend (dev server).
// Override with the MEDIX_URL environment variable if needed.
const BASE_URL = process.env.MEDIX_URL || "http://localhost:3000";

async function buildDriver() {
  return new Builder().forBrowser("chrome").build();
}

module.exports = { BASE_URL, buildDriver };
