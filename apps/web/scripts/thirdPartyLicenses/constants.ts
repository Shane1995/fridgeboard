export const OUTPUT_FILE = 'dist/third-party-licenses.txt';

// Dev dependencies whose code still ends up in dist: Tailwind's CSS reset and the Workbox service worker runtime.
export const SHIPPED_DEV_PACKAGES = [
  'tailwindcss',
  'workbox-core',
  'workbox-precaching',
  'workbox-routing',
  'workbox-strategies',
  'workbox-window',
];

export const LICENSE_FILE_PATTERN = /^(licen[cs]e|copying|notice)(\..*)?$/i;

export const MISSING_LICENSE_TEXT = '(no licence file in the package; see its homepage)';
