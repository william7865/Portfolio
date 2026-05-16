export type Feather = { id: number; x: number; y: number; born: number };

let nextId = 0;
const MAX_FEATHERS = 12;

export function spawnFeather(
  list: Feather[],
  x: number,
  y: number,
  now: number
): Feather[] {
  const next = [...list, { id: nextId++, x, y, born: now }];
  return next.length > MAX_FEATHERS ? next.slice(-MAX_FEATHERS) : next;
}

export function pruneFeathers(list: Feather[], now: number, lifespanMs = 600): Feather[] {
  return list.filter((f) => now - f.born < lifespanMs);
}
