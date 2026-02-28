import { test, expect } from "@playwright/test";
const regx = /^$/;
test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  // Debug: take screenshot to see what's actually on the page
  await page.screenshot({ path: "debug-login-page.png" });

  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Name" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill("arunkumar");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("arunkumar@123");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("arunkumar@gmail.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("arun@123");
  await page
    .locator("form")
    .getByRole("button")
    .filter({ hasText: regx })
    .click();
  await page
    .locator("form")
    .getByRole("button")
    .filter({ hasText: regx })
    .click();
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("arunkumar@gmail.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("arun@123");
  await page
    .locator("form")
    .getByRole("button")
    .filter({ hasText: regx })
    .click();

  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  await page.getByRole("button", { name: "Login" }).click();
});
