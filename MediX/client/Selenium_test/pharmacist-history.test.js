const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Pharmacist - History Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the Bill History heading", async function () {
    await driver.get(BASE_URL + "/pharmacist/History");
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Bill History')]")),
      30000
    );
    assert.ok((await heading.getText()).includes("Bill History"));
  });

  it("shows the search and filter controls", async function () {
    await driver.get(BASE_URL + "/pharmacist/History");
    const search = await driver.findElement(
      By.css("input[placeholder*='Search by Prescription ID']")
    );
    assert.ok(search);
    const selects = await driver.findElements(By.css("select"));
    assert.ok(selects.length >= 2, "Expected at least two filter selects");
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
