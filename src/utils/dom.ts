// Headless DOM setup for CLI SVG export
// Lazily attaches a minimal DOM to globalThis for d3 + XMLSerializer usage.
export function ensureDom() {
  if (typeof (globalThis as any).document !== 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(`<!DOCTYPE html><body><div id="root"></div></body>`);
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).XMLSerializer = dom.window.XMLSerializer;
}