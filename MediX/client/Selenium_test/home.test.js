const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Home Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the MediX title", async function () {
    await driver.get(BASE_URL + "/");
    const title = await driver.getTitle();
    assert.ok(title.includes("MediX"));
  });

  it("shows the hero heading", async function () {
    await driver.get(BASE_URL + "/");
    const heading = await driver.wait(
      until.elementLocated(By.tagName("h1")),
      30000
    );
    const text = await heading.getText();
    assert.ok(text.includes("Your Health"));
    assert.ok(text.includes("Our Priority"));
  });

  it("has a Sign In link", async function () {
    await driver.get(BASE_URL + "/");
    const links = await driver.findElements(By.css("a[href='/signin']"));
    assert.ok(links.length > 0, "Expected at least one Sign In link");
  });

  it("has a Book Appointment link", async function () {
    await driver.get(BASE_URL + "/");
    const links = await driver.findElements(
      By.css("a[href='/request-appointment']")
    );
    assert.ok(links.length > 0, "Expected a Book Appointment link");
  });

  it("has a Check Status link", async function () {
    await driver.get(BASE_URL + "/");
    const links = await driver.findElements(By.css("a[href='/patient-status']"));
    assert.ok(links.length > 0, "Expected a Check Status link");
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
