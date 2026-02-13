import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Shell / Smoke
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Symbol / Precision
// ---------------------------------------------------------------------------

test('switching to ETH updates precision labels and keeps orderbook usable', async ({
  page,
}) => {
  await page.goto('/')

  const symbolSelect = page.getByLabel('Symbol', { exact: true })
  const precisionSelect = page.getByLabel('Precision', { exact: true })

  await expect(symbolSelect).toBeVisible()
  await expect(precisionSelect).toBeVisible()

  await expect(precisionSelect).toHaveValue('0')

  await symbolSelect.selectOption('ETH')
  await expect(symbolSelect).toHaveValue('ETH')

  await precisionSelect.selectOption('2')
  await expect(precisionSelect).toHaveValue('2')

  await expect(page.getByText('Price').first()).toBeVisible()
  await expect(
    page.getByText(/Spread|Connecting to orderbook|—/),
  ).toBeVisible()
})

// ---------------------------------------------------------------------------
// Loading overlay (shimmer)
// ---------------------------------------------------------------------------

test('shows loading overlay on initial load and removes it when data arrives', async ({
  page,
}) => {
  await page.goto('/')

  // Loading overlay should be visible immediately
  await expect(
    page.getByText('Connecting to orderbook...'),
  ).toBeVisible()

  // After connection + shimmer, overlay disappears and Spread or prices appear
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })
  await expect(
    page.getByText('Connecting to orderbook...'),
  ).not.toBeVisible()
})

// ---------------------------------------------------------------------------
// Connection status and reconnect
// ---------------------------------------------------------------------------

test('shows Connected status after WebSocket connects', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
})

test('shows Retry button when connection fails and allows manual retry', async ({
  page,
  context,
}) => {
  await page.goto('/')

  // Wait for initial connection to establish
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })

  // Block WebSocket requests to simulate network failure
  await context.route('**/api.hyperliquid.xyz/**', (route) => route.abort())

  // Force a reconnect by navigating away and back (or we can wait for
  // the heartbeat to trigger; instead we'll reload with the block active)
  await page.reload()

  // Should show Reconnecting or Error with a Retry button
  await expect(
    page.getByText(/Reconnecting|Error/),
  ).toBeVisible({ timeout: 20000 })

  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible({
    timeout: 20000,
  })

  // Unblock and click retry
  await context.unrouteAll()
  await page.getByRole('button', { name: 'Retry' }).click()

  // Should reconnect
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
})

// ---------------------------------------------------------------------------
// Tab visibility (unsubscribe on hidden, resubscribe on visible)
// ---------------------------------------------------------------------------

test('reconnects when tab regains visibility', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })

  // Simulate tab hidden → visible cycle
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })

  // Give time for disconnect
  await page.waitForTimeout(1000)

  // Now simulate tab becoming visible again
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })

  // Should reconnect and show data again
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })
})

// ---------------------------------------------------------------------------
// Orderbook data flows after connection
// ---------------------------------------------------------------------------

test('displays bid and ask prices after connecting', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })

  // At least one bid and one ask price should be visible (colored text)
  // We check for the Spread display which only shows when both sides have data
  const spreadText = await page.getByText(/Spread/).textContent()
  expect(spreadText).toMatch(/Spread\s+[\d,]+/)
})

// ---------------------------------------------------------------------------
// Responsive layout
// ---------------------------------------------------------------------------

test('mobile viewport (375×812): shows asks, spread, and bids in single column', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })

  // Header controls visible
  await expect(page.getByText('Symbol')).toBeVisible()
  await expect(page.getByText('Precision')).toBeVisible()

  // Single Price/Size/Total header (not duplicated per side)
  const priceHeaders = page.getByText('Price')
  await expect(priceHeaders.first()).toBeVisible()

  // Spread is visible (between asks and bids)
  await expect(page.getByText(/Spread/)).toBeVisible()

  // Widget fills width — check it's wider than 350px
  const widget = page.locator('.rounded-lg.border')
  const box = await widget.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(340)

  await context.close()
})

test('desktop viewport (1280×800): shows full orderbook centered', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })

  // Widget is centered (left offset > 0, and not flush to the edge)
  const widget = page.locator('.rounded-lg.border')
  const box = await widget.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThan(100) // centered, not flush left

  await context.close()
})

test('mobile viewport: info panel overlays the orderbook', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })

  // Open info panel
  await page.getByRole('button', { name: 'Orderbook legend' }).click()

  // Legend heading should be visible
  await expect(
    page.getByRole('heading', { name: 'Orderbook Legend' }).first(),
  ).toBeVisible()

  // Close by pressing Escape
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('heading', { name: 'Orderbook Legend' }),
  ).not.toBeVisible()

  await context.close()
})

test('tablet viewport (768×1024): layout works without overflow', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Spread/)).toBeVisible({ timeout: 15000 })

  // Widget is visible and reasonably sized
  const widget = page.locator('.rounded-lg.border')
  const box = await widget.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(300)
  expect(box!.width).toBeLessThan(768)

  await context.close()
})
