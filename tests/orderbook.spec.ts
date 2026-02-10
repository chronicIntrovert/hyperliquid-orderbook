import { expect, test } from '@playwright/test'

test('renders orderbook widget shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Symbol')).toBeVisible()
  await expect(page.getByText('nSigFigs')).toBeVisible()

  await expect(page.getByText('Price')).toBeVisible()
  await expect(page.getByText('Size')).toBeVisible()
  await expect(page.getByText('Total')).toBeVisible()

  await expect(
    page.getByText(/Connecting|Connected|Reconnecting|Error/),
  ).toBeVisible()
})

