const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Sign In Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads the sign in form", async function () {
    await driver.get(BASE_URL + "/signin");
    const email = await driver.wait(
      until.elementLocated(By.css("input[type='email']")),
      30000
    );
    const password = await driver.findElement(By.css("input[type='password']"));
    const submit = await driver.findElement(By.css("button[type='submit']"));
    assert.ok(email);
    assert.ok(password);
    assert.ok((await submit.getText()).includes("Sign In"));
  });

  it("shows an error for invalid credentials", async function () {
    await driver.get(BASE_URL + "/signin");
    const email = await driver.wait(
      until.elementLocated(By.css("input[type='email']")),
      30000
    );
    await email.sendKeys("nobody@example.com");
    await driver
      .findElement(By.css("input[type='password']"))
      .sendKeys("wrongpass123");
    await driver.findElement(By.css("button[type='submit']")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(text(),'Invalid credentials')]")
      ),
      30000
    );
    assert.ok((await error.getText()).includes("Invalid credentials"));
  });

  it("logs in as admin and redirects to the admin dashboard", async function () {
    await driver.get(BASE_URL + "/signin");
    const email = await driver.wait(
      until.elementLocated(By.css("input[type='email']")),
      30000
    );
    await email.sendKeys("admin@admin.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("admin");
    await driver.findElement(By.css("button[type='submit']")).click();

    await driver.wait(until.urlContains("/admin"), 30000);
    const card = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Total Employees')]")),
      30000
    );
    assert.ok((await card.getText()).includes("Total Employees"));
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
