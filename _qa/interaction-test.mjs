import { createRequire } from 'node:module';
const require = createRequire('/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
await page.addInitScript(() => localStorage.setItem('game_locale', 'en'));
await page.goto('http://127.0.0.1:4194/?user_name=Alexandria%20Longname-Santiago', { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' });
await page.locator('.fmf-start').dispatchEvent('pointerdown');
await page.waitForSelector('.fmf--playing');

const first = await page.locator('.fmf-stage').evaluate(el => ({
  face: el.classList.contains('fmf-stage--left') ? 'left' : 'right',
  sign: el.querySelector('.fmf-sign--cue .fmf-arrow')?.classList.contains('fmf-arrow--left') ? 'left' : 'right',
}));
const button = first.face === 'left' ? page.locator('.fmf-controls button:nth-child(1)') : page.locator('.fmf-controls button:nth-child(2)');
const before = performance.now();
await button.dispatchEvent('pointerdown');
await page.waitForSelector('.fmf--correct');
const feedbackMs = Math.round(performance.now() - before);
const overflow = await page.locator('.fmf').evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight }));
const controls = await page.locator('.fmf-controls button').evaluateAll(nodes => nodes.map(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
await page.waitForSelector('.fmf--playing');
const secondFace = await page.locator('.fmf-stage').evaluate(el => el.classList.contains('fmf-stage--left') ? 'left' : 'right');
await page.locator(secondFace === 'left' ? '.fmf-controls button:nth-child(2)' : '.fmf-controls button:nth-child(1)').dispatchEvent('pointerdown');
await page.waitForSelector('.fmf--wrong');
await page.waitForTimeout(190);
const wrongState = await page.locator('.fmf').evaluate(el => ({
  scrollWidth: el.scrollWidth,
  width: el.clientWidth,
  avatarTransform: getComputedStyle(el.querySelector('.fmf-stage>.fmf-avatar')).transform,
  stamp: el.querySelector('.fmf-stamp')?.textContent,
}));
const zh = await browser.newPage({ viewport: { width: 320, height: 568 } });
await zh.addInitScript(() => localStorage.setItem('game_locale', 'zh'));
await zh.goto('http://127.0.0.1:4194/?user_name=%E8%B6%85%E7%BA%A7%E9%95%BF%E7%9A%84%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7%E5%90%8D', { waitUntil: 'networkidle' });
await zh.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' });
const zhState = await zh.locator('.fmf').evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, title: el.querySelector('h1')?.textContent, cta: el.querySelector('.fmf-start')?.textContent?.trim() }));
await zh.close();
process.stdout.write(JSON.stringify({ firstCueCongruent: first.face === first.sign, feedbackMs, overflow, controls, wrongState, zhState }) + '\n');
await browser.close();
