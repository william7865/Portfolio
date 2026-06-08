import { describe, it, expect } from 'vitest';
import { parseDevice } from './device';

describe('parseDevice', () => {
  it('detects an iPhone as mobile', () => {
    expect(parseDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit Mobile')).toBe('mobile');
  });

  it('detects an Android phone as mobile', () => {
    expect(parseDevice('Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit Chrome Mobile Safari')).toBe('mobile');
  });

  it('detects an iPad as tablet', () => {
    expect(parseDevice('Mozilla/5.0 (iPad; CPU OS 17_0) AppleWebKit Safari')).toBe('tablet');
  });

  it('detects an Android tablet (no "Mobile") as tablet', () => {
    expect(parseDevice('Mozilla/5.0 (Linux; Android 14; Tab) AppleWebKit Chrome Safari')).toBe('tablet');
  });

  it('detects a desktop UA as desktop', () => {
    expect(parseDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit Chrome Safari')).toBe('desktop');
  });

  it('falls back to desktop for an empty UA', () => {
    expect(parseDevice('')).toBe('desktop');
  });
});
