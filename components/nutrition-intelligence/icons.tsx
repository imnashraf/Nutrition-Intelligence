import type { ReactNode, SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number; strokeWidth?: number };

function Icon({ size = 16, strokeWidth = 1.6, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Brand mark: a seed with a stem. */
export const LogoMark = (p: IconProps) => (
  <Icon size={22} {...p}>
    <path d="M12 3c5 3 7 7.5 7 11a7 7 0 0 1-14 0c0-3.5 2-8 7-11z" />
    <path d="M12 9v12" />
  </Icon>
);

export const IconClock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

export const IconArrowUp = (p: IconProps) => (
  <Icon size={18} strokeWidth={1.8} {...p}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon size={12} strokeWidth={2} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const IconTarget = (p: IconProps) => (
  <Icon size={14} strokeWidth={1.8} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const IconCopy = (p: IconProps) => (
  <Icon size={17} {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2.5" />
    <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon size={17} strokeWidth={1.8} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const IconThumbUp = (p: IconProps) => (
  <Icon size={17} {...p}>
    <path d="M7 10v10H4V10z" />
    <path d="M7 10l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7" />
  </Icon>
);

export const IconThumbDown = (p: IconProps) => (
  <Icon size={17} style={{ transform: 'rotate(180deg)' }} {...p}>
    <path d="M7 10v10H4V10z" />
    <path d="M7 10l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7" />
  </Icon>
);

export const IconShare = (p: IconProps) => (
  <Icon size={17} {...p}>
    <path d="M12 15V4" />
    <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
    <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </Icon>
);

export const IconInfo = (p: IconProps) => (
  <Icon strokeWidth={1.7} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Icon>
);

export const IconAlert = (p: IconProps) => (
  <Icon size={14} strokeWidth={1.9} {...p}>
    <path d="M12 3 2.5 20h19z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon size={18} strokeWidth={1.7} {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);

export const IconExternal = (p: IconProps) => (
  <Icon size={14} strokeWidth={1.8} {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Icon>
);

export const IconRetry = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12a8 8 0 1 0 2.5-5.8" />
    <path d="M4 4v4.5h4.5" />
  </Icon>
);
