const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Pharmacist - Medicines Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("shows the Add Medicine and Low Stock buttons", async function () {
    await driver.get(BASE_URL + "/pharmacist/Medicines");
    const add = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Add Medicine')]")),
      30000
    );
    assert.ok(add);
    const lowStock = await driver.findElement(
      By.xpath("//button[contains(text(),'Low Stock List')]")
    );
    assert.ok(lowStock);
  });

  it("has a medicine search box", async function () {
    await driver.get(BASE_URL + "/pharmacist/Medicines");
    const search = await driver.findElement(
      By.css("input[placeholder*='Search by name, company, or generic name']")
    );
    assert.ok(search);
  });

  it("opens the Add Medicine form modal", async function () {
    await driver.get(BASE_URL + "/pharmacist/Medicines");
    const add = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Add Medicine')]")),
      30000
    );
    await add.click();
    const company = await driver.wait(
      until.elementLocated(By.id("company")),
      15000
    );
    assert.ok(company);
    for (const id of ["name", "genericName", "quantity", "totalCostPrice", "sellingPricePerUnit", "expiryDate"]) {
      const el = await driver.findElement(By.id(id));
      assert.ok(el, `Expected medicine field #${id}`);
    }
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
