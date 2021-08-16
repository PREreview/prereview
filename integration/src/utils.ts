import { ElementHandle, Page, PageScreenshotOptions } from '@playwright/test';
import glur from 'glur';
import { PNG } from 'pngjs';

export async function screenshot(
  page: Page,
  focus?: ElementHandle | string,
): Promise<Buffer> {
  await page.waitForLoadState();

  if (typeof focus === 'string') {
    focus = await page.waitForSelector(focus);
  }

  await Promise.all([
    hideTwitterTimelines(page),
    resetCarousels(page),
    removeTransitions(page),
  ]);

  if (focus) {
    await focus.scrollIntoViewIfNeeded();

    return safeScreenshot(page);
  }

  return safeScreenshot(page, { fullPage: true });
}

async function safeScreenshot(page: Page, options: PageScreenshotOptions = {}) {
  return await page.screenshot(options).then(blur);
}

function blur(image: Buffer) {
  const png = PNG.sync.read(image);

  glur(png.data, png.width, png.height, 5);

  return PNG.sync.write(png, { filterType: 4 });
}

async function hideTwitterTimelines(page: Page) {
  await page.addStyleTag({
    content: `
      .twitter-timeline {
        visibility: hidden !important;
      }
    `,
  });
}

async function resetCarousels(page: Page) {
  const carouselControls = await page.$$('.slick-dots :text("1")');

  await Promise.all(carouselControls.map(controls => controls.click()));
}

async function removeTransitions(page: Page) {
  await page.addStyleTag({
    content: `
        *,
        *::before,
        *::after {
          transition: none !important;
        }
      `,
  });
}
