export type Device = 'mobile' | 'tablet' | 'desktop';

/** Coarse device class from a User-Agent string. Tablet is tested before mobile. */
export function parseDevice(ua: string): Device {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile';
  return 'desktop';
}
