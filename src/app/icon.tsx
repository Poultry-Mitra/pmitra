
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
            <path d="M18.88 12.43a6.5 6.5 0 1 0-10.32 5.52" />
            <path d="M12.33 22A6.5 6.5 0 0 0 22 14.25a1 1 0 0 0-1-1h-9.5" />
            <path d="M12.33 22a2 2 0 1 0 4-3 2 2 0 0 0-4 3Z" />
            <path d="M7 10.5h.01" />
            <path d="m2 14.5 1.25-1.25" />
            <path d="M19 8.5a2.5 2.5 0 0 1 0 5" />
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
        <path d="M18.88 12.43a6.5 6.5 0 1 0-10.32 5.52" />
        <path d="M12.33 22A6.5 6.5 0 0 0 22 14.25a1 1 0 0 0-1-1h-9.5" />
        <path d="M12.33 22a2 2 0 1 0 4-3 2 2 0 0 0-4 3Z" />
        <path d="M7 10.5h.01" />
        <path d="m2 14.5 1.25-1.25" />
        <path d="M19 8.5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}
