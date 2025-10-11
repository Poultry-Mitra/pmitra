
import type { SVGProps } from 'react';

export function AppIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
          <path d="M18.16 13.91A6.5 6.5 0 0 1 12 20a6.5 6.5 0 0 1-6.16-6.09" />
          <path d="M12 4a2 2 0 0 1 2 2v2a2 2 0 1 1-4 0V6a2 2 0 0 1 2-2z" />
          <path d="M11 14.15V15.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1.35" />
          <path d="M8.42 12.38a2 2 0 0 0-1.84-3.53" />
          <path d="M17.42 8.85a2 2 0 0 0-1.84 3.53" />
        </svg>
    )
}

export default function Favicon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-full text-primary"
    >
        <path d="M18.16 13.91A6.5 6.5 0 0 1 12 20a6.5 6.5 0 0 1-6.16-6.09" />
        <path d="M12 4a2 2 0 0 1 2 2v2a2 2_0 1 1-4 0V6a2 2 0 0 1 2-2z" />
        <path d="M11 14.15V15.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1.35" />
        <path d="M8.42 12.38a2 2 0 0 0-1.84-3.53" />
        <path d="M17.42 8.85a2 2 0 0 0-1.84 3.53" />
    </svg>
  );
}
