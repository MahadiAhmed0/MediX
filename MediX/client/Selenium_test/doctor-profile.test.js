const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Doctor - Profile Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("shows an error when no doctor email is stored", async function () {
    await driver.get(BASE_URL + "/");
    await driver.executeScript("localStorage.removeItem('email');");
    await driver.get(BASE_URL + "/doctor/profile");

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(),'Doctor email not found in localStorage')]")
      ),
      30000
    );
    assert.ok(
      (await error.getText()).includes("Doctor email not found in localStorage")
    );
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
