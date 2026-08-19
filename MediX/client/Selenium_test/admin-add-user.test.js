const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Admin - Add User Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads the Add User form", async function () {
    await driver.get(BASE_URL + "/admin/Add_User");
    const submit = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Add User')]")),
      30000
    );
    assert.ok(submit);
  });

  it("shows the user form fields", async function () {
    await driver.get(BASE_URL + "/admin/Add_User");
    for (const id of ["name", "email", "phone", "password", "address", "role", "gender", "age"]) {
      const el = await driver.findElement(By.id(id));
      assert.ok(el, `Expected field #${id}`);
    }
  });

  it("shows the role dropdown options", async function () {
    await driver.get(BASE_URL + "/admin/Add_User");
    const role = await driver.findElement(By.id("role"));
    const options = await role.findElements(By.css("option"));
    const labels = await Promise.all(options.map((o) => o.getText()));
    for (const expected of ["Select Role", "Doctor", "Pharmacist", "Receptionist"]) {
      assert.ok(labels.includes(expected), `Expected role option "${expected}"`);
    }
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
