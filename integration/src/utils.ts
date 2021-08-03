import glur from 'glur';
import { PNG } from 'pngjs';

export function blur(image: Buffer): Buffer {
  const png = PNG.sync.read(image);

  glur(png.data, png.width, png.height, 5);

  return PNG.sync.write(png, { filterType: 4 });
}
