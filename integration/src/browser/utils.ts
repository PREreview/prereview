import {
  ElementHandle,
  Frame,
  Locator,
  Page,
  PageScreenshotOptions,
} from '@playwright/test';
import glur from 'glur';
import { PNG } from 'pngjs';

type LocatorScreenshotOptions = Parameters<Locator['screenshot']>[0];

export async function screenshot(item: Locator): Promise<Buffer>;
export async function screenshot(
  item: Page,
  focus?: Locator | string,
): Promise<Buffer>;
export async function screenshot(
  item: Page | Locator,
  focus?: Locator | string,
): Promise<Buffer> {
  if (isPage(item)) {
    await Promise.all(item.frames().map((frame) => frame.waitForLoadState()));
  }

  const frame = await getFrame(item);

  await Promise.all([
    frame.waitForTimeout(300),
    hideTwitterTimelines(frame),
    resetCarousels(frame),
    removeAnimations(frame),
  ]);

  if (isLocator(item)) {
    return safeScreenshot(item);
  }

  if (focus) {
    await toLocator(item, focus).scrollIntoViewIfNeeded();

    return safeScreenshot(item);
  }

  return safeScreenshot(item, { fullPage: true });
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

async function hideTwitterTimelines(frame: Frame) {
  await frame.addStyleTag({
    content: `
      .twitter-timeline {
        visibility: hidden !important;
      }
    `,
  });
}

async function resetCarousels(frame: Frame) {
  const carouselControls = await frame.$$('.slick-dots :text("1")');

  await Promise.all(
    carouselControls.map(async controls => {
      if (await isIntersectingViewport(controls)) {
        await controls.click();
      }
    }),
  );
}

async function removeAnimations(frame: Frame) {
  await frame.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
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

async function getFrame(item: ElementHandle | Page | Locator): Promise<Frame> {
  if (isLocator(item)) {
    const handle = await item.elementHandle();

    if (!handle) {
      throw new Error('Unable to find a handle');
    }

    return getFrame(handle);
  }

  if (isElementHandle(item)) {
    const frame = await item.ownerFrame();

    if (!frame) {
      throw new Error('Unable to find a frame');
    }

    return frame;
  }

  return item.mainFrame();
}

function toLocator(page: Page, locator: string | Locator) {
  if (isLocator(locator)) {
    return locator;
  }

  return page.locator(locator);
}

function isElementHandle(item: unknown): item is ElementHandle {
  return typeof item === 'object' && item !== null && 'contentFrame' in item;
}

function isLocator(item: unknown): item is Locator {
  return typeof item === 'object' && item !== null && 'elementHandle' in item;
}

function isPage(item: unknown): item is Page {
  return typeof item === 'object' && item !== null && 'mainFrame' in item;
}
