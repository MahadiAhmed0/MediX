const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Admin Dashboard", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("shows the employee summary cards", async function () {
    await driver.get(BASE_URL + "/admin");
    const total = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Total Employees')]")),
      30000
    );
    assert.ok(total);
    for (const label of ["Doctors", "Pharmacists", "Receptionists"]) {
      const el = await driver.findElement(
        By.xpath(`//h2[contains(text(),'${label}')]`)
      );
      assert.ok(el, `Expected a "${label}" summary card`);
    }
  });

  it("shows navigation links and a logout button", async function () {
    await driver.get(BASE_URL + "/admin");
    const logout = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Logout')]")),
      30000
    );
    assert.ok(logout);
    for (const link of ["Home", "Add User", "Records", "Specs & Degrees"]) {
      const el = await driver.findElement(
        By.xpath(`//*[contains(text(),'${link}')]`)
      );
      assert.ok(el, `Expected a "${link}" navigation link`);
    }
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
