const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Doctor - Prescribe Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the New Prescription heading", async function () {
    await driver.get(BASE_URL + "/doctor/prescribe");
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'New Prescription')]")),
      30000
    );
    assert.ok((await heading.getText()).includes("New Prescription"));
  });

  it("shows the patient form and action buttons", async function () {
    await driver.get(BASE_URL + "/doctor/prescribe");
    const name = await driver.findElement(By.css("input[name='name']"));
    assert.ok(name);
    const createPatient = await driver.findElement(
      By.xpath("//button[contains(text(),'Create Patient')]")
    );
    assert.ok(createPatient);
    const save = await driver.findElement(
      By.xpath("//button[contains(text(),'Save and Continue')]")
    );
    assert.ok(save);
    const clear = await driver.findElement(
      By.xpath("//button[contains(text(),'Clear')]")
    );
    assert.ok(clear);
  });

  it("has a medicine name field and add-medicine control", async function () {
    await driver.get(BASE_URL + "/doctor/prescribe");
    const medicineName = await driver.findElement(
      By.xpath("//label[contains(text(),'Medicine Name')]")
    );
    assert.ok(medicineName);
    const addMedicine = await driver.findElement(
      By.css("button[aria-label='Add medicine']")
    );
    assert.ok(addMedicine);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
