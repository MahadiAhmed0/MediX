const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Pharmacist Dashboard", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("shows the overview cards", async function () {
    await driver.get(BASE_URL + "/pharmacist");
    await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Revenue Overview')]")),
      30000
    );
    for (const label of ["Revenue Overview", "Stock Alert", "Expiry Alert"]) {
      const el = await driver.findElement(
        By.xpath(`//h2[contains(text(),'${label}')]`)
      );
      assert.ok(el, `Expected a "${label}" card`);
    }
  });

  it("shows the navigation links", async function () {
    await driver.get(BASE_URL + "/pharmacist");
    for (const link of ["Medicines", "Sell", "History"]) {
      const el = await driver.findElement(
        By.xpath(`//a[contains(@href,'/pharmacist')]//span[text()='${link}']`)
      );
      assert.ok(el, `Expected a "${link}" navigation link`);
    }
    const logout = await driver.findElement(
      By.xpath("//button[contains(text(),'Logout')]")
    );
    assert.ok(logout);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
