import { expect, test } from '@playwright/test'

test('renders orderbook widget shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Symbol')).toBeVisible()
  await expect(page.getByText('Precision')).toBeVisible()

  await expect(page.getByText('Price').first()).toBeVisible()
  await expect(page.getByText('Size').first()).toBeVisible()
  await expect(page.getByText('Total').first()).toBeVisible()

  await expect(
    page.getByText(/Connecting|Connected|Reconnecting|Error/),
  ).toBeVisible()
})

