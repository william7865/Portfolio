const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export function createKonamiDetector(onComplete: () => void) {
  let index = 0;
  let triggered = false;

  return {
    push(key: string) {
      if (triggered) return;
      const normalized = key.length === 1 ? key.toLowerCase() : key;
      if (normalized === SEQUENCE[index]) {
        index++;
        if (index === SEQUENCE.length) {
          triggered = true;
          onComplete();
        }
      } else {
        index = normalized === SEQUENCE[0] ? 1 : 0;
      }
    },
    reset() {
      index = 0;
      triggered = false;
    }
  };
}
