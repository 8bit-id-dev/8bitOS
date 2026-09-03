import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
};

export const IconHome = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M3 11L12 3L21 11V21H3V11Z" />
    <path d="M10 21V14H14V21" />
  </svg>
);

export const IconClass = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M5 3H19V21H5V3Z" />
    <path d="M9 3V21" />
    <path d="M12 7H16" />
    <path d="M12 11H16" />
    <path d="M12 15H15" />
  </svg>
);

export const IconWork = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M3 7H21V20H3V7Z" />
    <path d="M9 7V4H15V7" />
    <path d="M11 12H13" />
  </svg>
);

export const IconTools = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M14 3L17 6L13 10L10 10L10 7L14 3Z" />
    <path d="M10 10L4 16V20H8L14 14" />
  </svg>
);

export const IconSystem = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M4 4H10V10H4V4Z" />
    <path d="M14 4H20V10H14V4Z" />
    <path d="M4 14H10V20H4V14Z" />
    <path d="M14 14H20V20H14V14Z" />
  </svg>
);
