const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Admin - Profile Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the Admin Profile heading", async function () {
    await driver.get(BASE_URL + "/admin/Profile");
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(),'Admin Profile')]")),
      30000
    );
    assert.ok((await heading.getText()).includes("Admin Profile"));
  });

  it("shows the admin details and edit button", async function () {
    await driver.get(BASE_URL + "/admin/Profile");
    const role = await driver.findElement(
      By.xpath("//*[contains(text(),'System Administrator')]")
    );
    assert.ok(role);
    const edit = await driver.findElement(
      By.xpath("//button[contains(text(),'Edit Profile')]")
    );
    assert.ok(edit);
    const support = await driver.findElement(
      By.xpath("//*[contains(text(),'Contact Support')]")
    );
    assert.ok(support);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
