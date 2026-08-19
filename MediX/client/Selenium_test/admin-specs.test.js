const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Admin - Specifications & Qualifications Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the Specializations & Degrees heading", async function () {
    await driver.get(BASE_URL + "/admin/specifications-qualifications");
    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(text(),'Specializations & Degrees')]")
      ),
      30000
    );
    assert.ok((await heading.getText()).includes("Specializations & Degrees"));
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
