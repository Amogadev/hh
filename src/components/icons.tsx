import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
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
      <path d="M10 22v-6.57" />
      <path d="M12 22a2.43 2.43 0 0 0 2-2.19" />
      <path d="M14 22a2.43 2.43 0 0 0 2-2.19" />
      <path d="M16 22a2.43 2.43 0 0 0 2-2.19" />
      <path d="M18 19.81V6.57" />
      <path d="M20 19.81A2.43 2.43 0 0 0 22 17.62" />
      <path d="M22 13.43V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v13.62a2.43 2.43 0 0 0 2 2.19" />
      <path d="M4 17.62a2.43 2.43 0 0 0 2 2.19" />
      <path d="M6 19.81V6.57" />
      <path d="M8 19.81a2.43 2.43 0 0 0 2-2.19" />
      <path d="M2 10.43h20" />
    </svg>
  );
}
