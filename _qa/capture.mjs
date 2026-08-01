import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const { chromium } = require('playwright');
const out = '/Users/yin/code/games/follow-my-face/_qa/ui';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });

function faceDirection(page) {
  return page.locator('.fmf-stage').evaluate(el => el.classList.contains('fmf-stage--left') ? 'left' : 'right');
}
function signDirection(page) {
  return page.locator('.fmf-sign--cue .fmf-arrow').evaluate(el => el.classList.contains('fmf-arrow--left') ? 'left' : 'right');
}
async function correct(page) {
  const face = await faceDirection(page);
  await page.locator(face === 'left' ? '.fmf-controls button:nth-child(1)' : '.fmf-controls button:nth-child(2)').dispatchEvent('pointerdown');
}
async function wrong(page) {
  const face = await faceDirection(page);
  await page.locator(face === 'left' ? '.fmf-controls button:nth-child(2)' : '.fmf-controls button:nth-child(1)').dispatchEvent('pointerdown');
}

for (const [width, height] of [[390, 844], [320, 568]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.addInitScript(() => localStorage.setItem('game_locale', 'en'));
  await page.goto('http://127.0.0.1:4194/?user_name=Alexandria%20Longname-Santiago', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' });
  await page.screenshot({ path: `${out}/platform-layout-cover-${width}x${height}.png` });
  await page.locator('.fmf-start').dispatchEvent('pointerdown');
  await page.waitForSelector('.fmf--playing');
  await page.waitForTimeout(130);
  await page.screenshot({ path: `${out}/platform-layout-cue-${width}x${height}.png` });
  await correct(page);
  await page.waitForSelector('.fmf--correct');
  await page.waitForTimeout(140);
  await page.screenshot({ path: `${out}/platform-layout-correct-${width}x${height}.png` });
  await page.waitForSelector('.fmf--playing');
  await page.waitForTimeout(110);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await faceDirection(page) !== await signDirection(page)) break;
    await correct(page);
    await page.waitForSelector('.fmf--correct');
    await page.waitForSelector('.fmf--playing');
    await page.waitForTimeout(110);
  }
  await page.screenshot({ path: `${out}/platform-layout-conflict-${width}x${height}.png` });
  await wrong(page);
  await page.waitForSelector('.fmf--wrong');
  await page.waitForTimeout(190);
  await page.screenshot({ path: `${out}/platform-layout-wrong-${width}x${height}.png` });
  await page.waitForSelector('.fmf--playing');
  await wrong(page);
  await page.waitForSelector('.fmf--playing');
  await wrong(page);
  await page.waitForSelector('.fmf--result');
  await page.screenshot({ path: `${out}/platform-layout-result-${width}x${height}.png` });
  await page.locator('.fmf-start').dispatchEvent('pointerdown');
  await page.waitForSelector('.fmf--playing');
  await page.waitForSelector('.fmf--timeout', { timeout: 2200 });
  await page.waitForTimeout(130);
  await page.screenshot({ path: `${out}/platform-layout-timeout-${width}x${height}.png` });
  await page.close();
}

const external = await browser.newPage({ viewport: { width: 390, height: 844 } });
await external.addInitScript(() => localStorage.setItem('game_locale', 'en'));
await external.goto('http://127.0.0.1:4194/?user_name=AlterU', { waitUntil: 'networkidle' });
await external.waitForTimeout(500);
await external.screenshot({ path: `${out}/external-guest-cover-390x844.png` });
await external.close();
await browser.close();
