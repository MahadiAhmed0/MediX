const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Patient Status Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the status heading", async function () {
    await driver.get(BASE_URL + "/patient-status");
    const heading = await driver.wait(
      until.elementLocated(By.tagName("h1")),
      30000
    );
    assert.ok((await heading.getText()).includes("Medical Status"));
  });

  it("has a token number input and a search button", async function () {
    await driver.get(BASE_URL + "/patient-status");
    const input = await driver.findElement(By.id("patientId"));
    const button = await driver.findElement(
      By.xpath("//button[contains(text(),'Search')]")
    );
    assert.ok(input);
    assert.ok(button);
  });

  it("shows an error when searching with an empty token", async function () {
    await driver.get(BASE_URL + "/patient-status");
    const button = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Search')]")),
      30000
    );
    await button.click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//p[contains(text(),'Please enter your token number')]")
      ),
      15000
    );
    assert.ok((await error.getText()).includes("Please enter your token number"));
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
