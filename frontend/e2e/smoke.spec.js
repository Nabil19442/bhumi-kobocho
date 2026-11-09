import { test, expect } from '@playwright/test';

test.describe('Primary Flow Smoke Test (Landing -> Check Land -> Plot Passport -> Guardian)', () => {
  test('primary citizen flow and demo banner compliance', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/ভূমি কবচ|Bhumi/i);

    // Verify presence of Demo disclaimer on Landing
    const landingText = await page.textContent('body');
    expect(landingText).toMatch(/DEMO DATA|ডেমো তথ্য/i);

    // 2. Click Primary CTA to Navigate to Check Land
    const ctaButton = page.locator('#hero-primary-cta');
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();

    // Verify URL transitioned to /check
    await expect(page).toHaveURL(/\/check/);
    await expect(page.locator('text=জমি কেনার আগে যাচাই').first()).toBeVisible({ timeout: 10000 });

    // Verify banner on /check
    const checkText = await page.textContent('body');
    expect(checkText).toMatch(/DEMO DATA|ডেমো তথ্য/i);

    // 3. Navigate to Plot Passport
    await page.goto('/passport/PCL-DHK-SAV-045-0558');
    await expect(page).toHaveURL(/\/passport/);
    await expect(page.locator('text=প্লট পাসপোর্ট').first()).toBeVisible({ timeout: 10000 });

    // Verify passport page loads and banner is present
    const passportText = await page.textContent('body');
    expect(passportText).toMatch(/DEMO DATA|ডেমো তথ্য/i);
    expect(passportText).toMatch(/PCL-DHK-SAV-045-0558|প্লট পাসপোর্ট|Plot Passport/i);

    // 4. Navigate to Guardian
    await page.goto('/guardian');
    await expect(page).toHaveURL(/\/guardian/);

    // Wait for lazy-loaded Guardian component to finish loading
    await expect(page.locator('text=ল্যান্ড গার্ডিয়ান').first()).toBeVisible({ timeout: 10000 });

    // Verify Guardian page loads, simulated badge/preview exists, and banner is present
    const guardianText = await page.textContent('body');
    expect(guardianText).toMatch(/DEMO DATA|ডেমো তথ্য/i);
    expect(guardianText).toMatch(/SIMULATED|সিমুলেটেড/i);
  });

  test('guided demo walkthrough steps smoothly through primary flow', async ({ page }) => {
    await page.goto('/');

    // Check for demo walkthrough button on landing page
    const walkthroughBtn = page.locator('#demo-walkthrough-btn');
    if (await walkthroughBtn.isVisible()) {
      await walkthroughBtn.click();

      // Step 1: should be at /check with walkthrough stepper
      await expect(page).toHaveURL(/\/check/);
      const stepper = page.locator('aside[aria-label="Demo Walkthrough Guide"]');
      await expect(stepper).toBeVisible();

      // Click Next Step
      const nextBtn = stepper.locator('button', { hasText: /পরবর্তী ধাপ|Next Step/i });
      await nextBtn.click();

      // Step 2: should be at /passport
      await expect(page).toHaveURL(/\/passport/);
      await expect(stepper).toBeVisible();

      // Click Next Step to Guardian
      await nextBtn.click();

      // Step 3: should be at /guardian
      await expect(page).toHaveURL(/\/guardian/);
      await expect(stepper).toBeVisible();
    }
  });
});
