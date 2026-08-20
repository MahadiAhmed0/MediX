const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Pharmacist - Sell Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("shows the Prescription Info and Receipt Preview sections", async function () {
    await driver.get(BASE_URL + "/pharmacist/Sell");
    const info = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Prescription Info')]")),
      30000
    );
    assert.ok(info);
    const preview = await driver.findElement(
      By.xpath("//h2[contains(text(),'Receipt Preview')]")
    );
    assert.ok(preview);
  });

  it("has a Prescription ID input and Finalize button", async function () {
    await driver.get(BASE_URL + "/pharmacist/Sell");
    const input = await driver.findElement(
      By.css("input[placeholder='Enter Prescription ID']")
    );
    assert.ok(input);
    const finalize = await driver.findElement(
      By.xpath("//button[contains(., 'Finalize and Lock')]")
    );
    assert.ok(finalize);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
