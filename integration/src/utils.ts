import { ElementHandle, Locator, Page, PageScreenshotOptions } from '@playwright/test';
import glur from 'glur';
import { PNG } from 'pngjs';

type LocatorScreenshotOptions = Parameters<Locator['screenshot']>[0];

export async function screenshot(item: Locator): Promise<Buffer>;
export async function screenshot(
  item: Page,
  focus?: Locator | string,
): Promise<Buffer>;
export async function screenshot(
  page: Page | Locator,
  focus?: Locator | string,
): Promise<Buffer> {
  if (isLocator(page)) {
    return safeScreenshot(page);
  }

  await Promise.all(page.frames().map(frame => frame.waitForLoadState()));

  if (typeof focus === 'string') {
    focus = page.locator(focus);
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

async function safeScreenshot(
  item: Locator,
  options?: LocatorScreenshotOptions,
): Promise<Buffer>;
async function safeScreenshot(
  item: Page,
  options?: PageScreenshotOptions,
): Promise<Buffer>;
async function safeScreenshot(item: Locator | Page, options = {}) {
  return await item.screenshot(options).then(blur);
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

  await Promise.all(
    carouselControls.map(async controls => {
      if (await isIntersectingViewport(controls)) {
        await controls.click();
      }
    }),
  );
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

async function isIntersectingViewport(element: ElementHandle<Element>) {
  const visibleRatio = await getVisibleRatio(element);

  return visibleRatio > 0;
}

async function getVisibleRatio(element: ElementHandle<Element>) {
  return await element.evaluate(async element => {
    return await new Promise<number>(resolve => {
      const observer = new IntersectionObserver(entries => {
        resolve(entries[0].intersectionRatio);
        observer.disconnect();
      });

      observer.observe(element);

      requestAnimationFrame(() => {
        // Do nothing
      });
    });
  });
}

function isLocator(item: unknown): item is Locator {
  return typeof item === 'object' && 'elementHandle' in item;
}
