export const DUR = {
  instant: '80ms',
  fast: '150ms',
  base: '250ms',
  slow: '400ms',
  slower: '600ms',
} as const;

export const EASE = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in: 'cubic-bezier(0.7, 0, 0.84, 0)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  emphasis: 'cubic-bezier(0.2, 0, 0, 1)',
  overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const T = {
  enter: `${DUR.base} ${EASE.out}`,
  exit: `${DUR.fast} ${EASE.in}`,
  panel: `${DUR.slow} ${EASE.emphasis}`,
  bounce: `${DUR.fast} ${EASE.overshoot}`,
} as const;
