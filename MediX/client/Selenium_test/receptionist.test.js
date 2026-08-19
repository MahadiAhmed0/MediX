const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Receptionist Dashboard", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("redirects to home when not authenticated", async function () {
    await driver.get(BASE_URL + "/");
    await driver.executeScript("localStorage.removeItem('receptionistId');");
    await driver.get(BASE_URL + "/receptionist");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(),'Your Health')]")),
      30000
    );
    const url = await driver.getCurrentUrl();
    assert.ok(url === BASE_URL + "/", "Expected redirect to the home page");
  });

  it("shows the dashboard when authenticated", async function () {
    await driver.get(BASE_URL + "/");
    await driver.executeScript(
      "localStorage.setItem('receptionistId','2502001');"
    );
    await driver.get(BASE_URL + "/receptionist");

    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(),'My Dashboard')]")),
      30000
    );
    assert.ok((await heading.getText()).includes("My Dashboard"));
    const pending = await driver.findElement(
      By.xpath("//h2[contains(text(),'Pending Appointment Requests')]")
    );
    assert.ok(pending);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
