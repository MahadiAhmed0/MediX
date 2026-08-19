const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Pharmacist - Profile Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the Pharmacist Profile heading", async function () {
    await driver.get(BASE_URL + "/pharmacist/Profile");
    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(text(),'Pharmacist Profile')]")
      ),
      30000
    );
    assert.ok((await heading.getText()).includes("Pharmacist Profile"));
  });

  it("shows the profile actions", async function () {
    await driver.get(BASE_URL + "/pharmacist/Profile");
    const edit = await driver.findElement(
      By.xpath("//button[contains(text(),'Edit Profile')]")
    );
    assert.ok(edit);
    const changePwd = await driver.findElement(
      By.xpath("//button[contains(text(),'Change Password')]")
    );
    assert.ok(changePwd);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
