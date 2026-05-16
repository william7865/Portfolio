export const COURT = {
  vbWidth: 1340,
  vbHeight: 610,
  net: 670,
  shortServiceLine: 198,
  backServiceDoubles: 76
};

export type ZoneName = 'service' | 'rallye' | 'smashes' | 'drop' | 'matchpoint';

export const ZONES: Record<
  ZoneName,
  { x: number; y: number; w: number; h: number; label: string }
> = {
  service: { x: 0, y: 0, w: 670, h: 305, label: 'Service' },
  rallye: { x: 0, y: 305, w: 670, h: 305, label: 'Rallye' },
  smashes: { x: 670, y: 0, w: 670, h: 200, label: 'Smashes' },
  drop: { x: 670, y: 200, w: 670, h: 200, label: 'Drop shot' },
  matchpoint: { x: 670, y: 400, w: 670, h: 210, label: 'Match Point' }
};
