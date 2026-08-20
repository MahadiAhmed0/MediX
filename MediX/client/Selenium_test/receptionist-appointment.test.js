const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Receptionist - Appointment Pages", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
    await driver.get(BASE_URL + "/");
    await driver.executeScript(
      "localStorage.setItem('receptionistId','2502001');"
    );
  });

  it("shows the Appointment Requests page", async function () {
    await driver.get(BASE_URL + "/receptionist/appointment");
    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(text(),'Appointment Requests')]")
      ),
      30000
    );
    assert.ok((await heading.getText()).includes("Appointment Requests"));
  });

  it("shows the appointment navigation tabs", async function () {
    await driver.get(BASE_URL + "/receptionist/appointment");
    for (const label of [
      "Appointment Requests",
      "Add Appointment",
      "Doctor",
      "Vitals Entry",
      "Appointment List",
    ]) {
      const el = await driver.findElement(
        By.xpath(`//a[contains(text(),'${label}')]`)
      );
      assert.ok(el, `Expected nav tab "${label}"`);
    }
  });

  it("shows the Add Appointment form", async function () {
    await driver.get(BASE_URL + "/receptionist/appointment/add");
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(),'Patient Info')]")),
      30000
    );
    assert.ok((await heading.getText()).includes("Patient Info"));
    const name = await driver.findElement(By.css("input[name='name']"));
    const contact = await driver.findElement(By.css("input[name='contact']"));
    const date = await driver.findElement(
      By.css("input[name='appointmentDate']")
    );
    assert.ok(name && contact && date);
    const add = await driver.findElement(
      By.xpath("//button[contains(text(),'Add Appointment')]")
    );
    assert.ok(add);
  });

  it("shows the Appointment List page", async function () {
    await driver.get(BASE_URL + "/receptionist/appointment/list");
    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(),'Current & Upcoming Appointments')]")
      ),
      30000
    );
    assert.ok(heading);
    const search = await driver.findElement(By.id("search"));
    assert.ok(search);
  });

  it("shows the Vitals Entry page", async function () {
    await driver.get(BASE_URL + "/receptionist/appointment/vitals");
    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(text(),'Select a Patient to Enter Vitals')]")
      ),
      30000
    );
    assert.ok(
      (await heading.getText()).includes("Select a Patient to Enter Vitals")
    );
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
