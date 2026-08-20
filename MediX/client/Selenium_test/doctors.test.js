const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Doctor Listing", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("redirects /request-appointment to the doctors page", async function () {
    await driver.get(BASE_URL + "/request-appointment");
    await driver.wait(
      until.urlContains("/request-appointment/doctors"),
      30000
    );
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/request-appointment/doctors"));
  });

  it("shows the Choose Your Doctor heading", async function () {
    await driver.get(BASE_URL + "/request-appointment/doctors");
    const heading = await driver.wait(
      until.elementLocated(By.tagName("h1")),
      30000
    );
    const text = await heading.getText();
    assert.ok(text.includes("Choose Your"));
    assert.ok(text.includes("Doctor"));
  });

  it("has a doctor search box", async function () {
    await driver.get(BASE_URL + "/request-appointment/doctors");
    const search = await driver.findElement(
      By.css("input[placeholder*='Search doctors']")
    );
    assert.ok(search);
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
