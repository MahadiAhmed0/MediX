const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { BASE_URL, buildDriver } = require("./config");

describe("MediX Book Appointment Page", function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  it("loads with the Book Appointment heading", async function () {
    await driver.get(BASE_URL + "/request-appointment/book");
    const heading = await driver.wait(
      until.elementLocated(By.tagName("h1")),
      30000
    );
    const text = await heading.getText();
    assert.ok(text.includes("Book"));
    assert.ok(text.includes("Appointment"));
  });

  it("shows the booking form fields", async function () {
    await driver.get(BASE_URL + "/request-appointment/book");
    const name = await driver.findElement(By.css("input[name='name']"));
    const contact = await driver.findElement(By.css("input[name='contact']"));
    const date = await driver.findElement(
      By.css("input[name='appointmentDate']")
    );
    assert.ok(name);
    assert.ok(contact);
    assert.ok(date);
  });

  it("disables submit when no doctor is selected", async function () {
    await driver.get(BASE_URL + "/request-appointment/book");
    const submit = await driver.findElement(By.css("button[type='submit']"));
    const disabled = await submit.getAttribute("disabled");
    assert.ok(
      disabled !== null,
      "Submit button should be disabled without a selected doctor"
    );
  });

  after(async function () {
    if (driver) await driver.quit();
  });
});
