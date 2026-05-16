const slotsForCount = (count: number, start: number, end: number, y: number) => {
  const step = (end - start) / (count + 1);
  return Array.from({ length: count }, (_, i) => ({ x: start + step * (i + 1), y }));
};

export function getPositions(
  category: 'Frontend' | 'Backend' | 'Database' | 'Tools',
  count: number
) {
  switch (category) {
    case 'Frontend':
      return slotsForCount(count, 50, 600, 100);
    case 'Backend':
      return slotsForCount(count, 740, 1290, 100);
    case 'Database':
      return slotsForCount(count, 472, 868, 305);
    case 'Tools':
      return slotsForCount(count, 538, 802, 510);
  }
}
