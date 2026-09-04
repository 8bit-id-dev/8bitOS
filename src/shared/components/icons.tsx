import type { SVGProps } from 'react';

// Pixel icon system (Doc 05 v2 §9): fill-based, 12x12 virtual grid,
// sharp edges, monochrome. Rendered at 20px default.

type IconProps = SVGProps<SVGSVGElement>;

const pixelProps: IconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 12 12',
  fill: 'currentColor',
  'aria-hidden': true,
};

// Each icon: array of "x,y,w,h" fill rects on a 12x12 grid.
const px = (rects: Array<[number, number, number, number]>) => (
  <g>
    {rects.map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} />
    ))}
  </g>
);

// HOME — house silhouette + door
const homeRects: Array<[number, number, number, number]> = [
  [5, 1, 2, 1], [4, 2, 4, 1], [3, 3, 6, 1], [2, 4, 8, 1], // roof
  [2, 5, 8, 6], // body
  [5, 7, 2, 4], // door (knockout via paint-order: draw bg-colored door)
];

export const IconHome = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(homeRects)}
    <rect x={5} y={7} width={2} height={4} fill="var(--c-surface)" />
  </svg>
);

// CLASS — open book: two pages + spine
const bookRects: Array<[number, number, number, number]> = [
  [2, 2, 3, 8], // left page
  [7, 2, 3, 8], // right page
  [5.5, 2, 1, 8], // spine
  [1, 2, 1, 1], [10, 2, 1, 1], // corners
];

export const IconClass = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(bookRects)}
    <rect x={3} y={4} width={1.5} height={1} fill="var(--c-surface)" opacity={0.9} />
    <rect x={3} y={6} width={1.5} height={1} fill="var(--c-surface)" opacity={0.9} />
    <rect x={7.5} y={4} width={1.5} height={1} fill="var(--c-surface)" opacity={0.9} />
    <rect x={7.5} y={6} width={1.5} height={1} fill="var(--c-surface)" opacity={0.9} />
  </svg>
);

// PLAN — calendar grid
const planRects: Array<[number, number, number, number]> = [
  [2, 2, 8, 8], // body
  [2, 2, 8, 1.5], // header band
  [3.5, 0.5, 1, 2], [7.5, 0.5, 1, 2], // binders
  [3.5, 4.5, 1, 1], [5.5, 4.5, 1, 1], [7.5, 4.5, 1, 1],
  [3.5, 6.5, 1, 1], [5.5, 6.5, 1, 1], [7.5, 6.5, 1, 1], // dates
];

export const IconPlan = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(planRects)}
  </svg>
);

// ASSESS — checklist: 2 rows with check + line
const assessRects: Array<[number, number, number, number]> = [
  [1, 2, 1, 1], [2, 3, 1, 1], [3, 2, 1, 1], [2, 1, 1, 1], // check mark pixelated
  [5, 2.5, 6, 1], // row 1 line
  [1, 6, 1, 1], [2, 7, 1, 1], [3, 6, 1, 1], [2, 5, 1, 1], // check 2
  [5, 6.5, 6, 1], // row 2 line
];

export const IconAssess = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(assessRects)}
  </svg>
);

// GRADE — bar chart ascending
const gradeRects: Array<[number, number, number, number]> = [
  [1, 8, 2, 3],
  [4, 6, 2, 5],
  [7, 3, 2, 8],
  [10, 1, 1, 10], // trend tick
];

export const IconGrade = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(gradeRects)}
  </svg>
);

// NOTES — notebook with lines
const notesRects: Array<[number, number, number, number]> = [
  [2, 1, 8, 10], // body
  [2, 1, 8, 1.5], // top band
  [3.5, 3.5, 5, 1], [3.5, 5.5, 5, 1], [3.5, 7.5, 3, 1], // text lines
];

export const IconNotes = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(notesRects)}
    <rect x={3} y={3.5} width={4} height={1} fill="var(--c-surface)" />
    <rect x={3} y={5.5} width={4} height={1} fill="var(--c-surface)" />
    <rect x={3} y={7.5} width={2} height={1} fill="var(--c-surface)" />
  </svg>
);

// TOOLS — grid of 4 squares (system hub)
const toolsRects: Array<[number, number, number, number]> = [
  [2, 2, 3, 3], [7, 2, 3, 3],
  [2, 7, 3, 3], [7, 7, 3, 3],
];

export const IconTools = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(toolsRects)}
  </svg>
);

// AI — pixel brain/face block (8bit AI identity)
const aiRects: Array<[number, number, number, number]> = [
  [4, 1, 4, 1], [3, 2, 6, 1], // top
  [2, 3, 8, 4], // head
  [3.5, 4.5, 1.5, 1.5], [7, 4.5, 1.5, 1.5], // eyes (surface knockout below)
  [3, 7, 6, 1], // mouth band
  [1, 3, 1, 3], [10, 3, 1, 3], // ears
];

export const IconAi = (props: IconProps) => (
  <svg {...pixelProps} {...props}>
    {px(aiRects)}
    <rect x={3.5} y={4.5} width={1.5} height={1.5} fill="var(--c-surface)" />
    <rect x={7} y={4.5} width={1.5} height={1.5} fill="var(--c-surface)" />
    <rect x={4} y={7} width={4} height={0.6} fill="var(--c-surface)" />
  </svg>
);

// Legacy aliases (keep old imports working)
export const IconWork = IconPlan;
export const IconSystem = IconTools;
