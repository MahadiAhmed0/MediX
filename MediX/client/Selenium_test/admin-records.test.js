const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Admin - Records Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the User Records heading", async function () {
    await driver.get(BASE_URL + "/admin/Records");
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(),'User Records')]")),
      30000
    );
    assert.ok((await heading.getText()).includes("User Records"));
  });

  it("shows the filter by role dropdown", async function () {
    await driver.get(BASE_URL + "/admin/Records");
    const select = await driver.findElement(By.id("role"));
    const options = await select.findElements(By.css("option"));
    const labels = await Promise.all(options.map((o) => o.getText()));
    for (const expected of ["All", "Doctor", "Pharmacist", "Receptionist"]) {
      assert.ok(labels.includes(expected), `Expected filter option "${expected}"`);
    }
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
