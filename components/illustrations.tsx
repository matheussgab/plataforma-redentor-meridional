import { useId } from "react";

/* Original vector illustrations: no stock or generated photographs of the project. */
export function KitchenArt({ className = "" }: { className?: string }) {
  const patternId = useId();
  return (
    <svg
      className={className}
      viewBox="0 0 600 500"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-8)"
        >
          <rect width="50" height="50" fill="#f7ecd5" />
          <rect width="24" height="50" fill="#eacaaa" opacity=".4" />
          <rect width="50" height="24" fill="#eacaaa" opacity=".4" />
        </pattern>
      </defs>
      <path
        d="M95 470C23 349 44 167 159 75c68-53 224-47 315 41 95 92 108 243 18 354H95Z"
        fill="#ebbd54"
      />
      <path
        d="M48 337c130-69 328-71 500-5l-26 168H53L48 337Z"
        fill={`url(#${patternId})`}
      />
      <ellipse
        cx="301"
        cy="393"
        rx="167"
        ry="42"
        fill="#ae784f"
        opacity=".14"
      />
      <path
        d="M128 275h345c-7 91-72 151-173 151s-164-60-172-151Z"
        fill="#fdf9ed"
      />
      <path
        d="M146 318c22 59 73 93 151 95 69 2 121-28 147-74-31 30-63 42-115 43-87 2-137-21-183-64Z"
        fill="#e5ddc8"
      />
      <ellipse cx="301" cy="276" rx="173" ry="64" fill="#fffdf4" />
      <ellipse cx="301" cy="276" rx="151" ry="48" fill="#db8749" />
      <path
        d="M171 273c15-33 61-48 105-39 18 4 39 18 47 42-56 26-99 35-152-3Z"
        fill="#f4e5be"
      />
      <g stroke="#d6c38e" strokeWidth="3" strokeLinecap="round">
        <path d="m194 259 9 3m15-15 8 5m-14 15 7 4m22-25 5 7m5 14 7 5m-59 6 7 3m27 4 8-1m18-17 7 3m15 8 8-1m-47 7 7 2m-8-30 7 2" />
      </g>
      <path
        d="M293 241c22-17 72-19 101 0 19 12 31 31 23 48-34 20-97 23-122-1-12-12-14-35-2-47Z"
        fill="#794533"
      />
      <g fill="#a96a48">
        <ellipse
          cx="310"
          cy="251"
          rx="9"
          ry="5"
          transform="rotate(25 310 251)"
        />
        <ellipse cx="339" cy="240" rx="9" ry="5" />
        <ellipse
          cx="369"
          cy="256"
          rx="10"
          ry="5"
          transform="rotate(-15 369 256)"
        />
        <ellipse cx="328" cy="273" rx="9" ry="5" />
        <ellipse cx="388" cy="278" rx="9" ry="5" />
        <ellipse cx="361" cy="291" rx="9" ry="5" />
        <ellipse cx="310" cy="291" rx="8" ry="4" />
      </g>
      <path
        d="M186 293c-29-10-42-27-29-40 11-12 28-2 29-2-8-23 18-34 31-17 7-23 34-12 32 6 28-12 43 12 22 29 26 18 3 40-22 30-11 16-35 13-42-2-8 5-17 3-21-4Z"
        fill="#58804b"
      />
      <path
        d="m180 271 63 15m-35-24 1 17m23-22-4 27"
        stroke="#a1b76d"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M389 246c17-22 32-15 38-1 12 3 21 17 12 27-15 7-39-6-50-26Z"
        fill="#ec7849"
      />
      <path
        d="m394 246 29 16m-13-21 18 10"
        stroke="#ffad64"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M249 186c-31-28 23-38 5-69m47 66c-27-29 28-48 5-80m41 86c-24-27 23-38 9-63"
        stroke="#fff8df"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M-5 371 100 320c18-9 44-6 64 8l47 29c10 7 3 19-8 16l-38-14 47 24c11 6 6 19-6 16l-58-21 43 22c11 7 5 18-6 15l-55-20c-34-10-49-1-75 8L0 427l-5-56Z"
        fill="#a55b3c"
      />
      <path d="m-4 355 61-27 32 74-90 39-3-86Z" fill="#3c6449" />
      <path
        d="m600 380-102-46c-20-9-40-7-61 5l-44 28c-10 8-2 19 9 15l32-12-43 24c-10 7-4 18 7 14l49-20-35 22c-10 7-4 18 7 14l49-20c23-8 35-5 55 3l77 35v-62Z"
        fill="#dc9879"
      />
      <path d="m600 362-63-26-30 72 93 39v-85Z" fill="#c56846" />
      <path
        d="m120 145 7-17 7 17 18 7-18 7-7 17-7-17-18-7 18-7Z"
        fill="#fcf8e9"
      />
      <path
        d="m446 198 5-12 5 12 13 5-13 5-5 13-5-13-13-5 13-5Z"
        fill="#fcf8e9"
      />
      <path
        d="M458 102c-3-18 15-26 20-8 9-17 26-8 20 6-5 13-29 22-29 22s-8-8-11-20Z"
        fill="#bc5a40"
      />
    </svg>
  );
}

export function ClothesArt() {
  return (
    <svg viewBox="0 0 520 320" fill="none" aria-hidden="true">
      <circle cx="274" cy="153" r="122" fill="#e1a293" opacity=".38" />
      <path
        d="M107 288V55h307v233M86 288h45m260 0h45"
        stroke="#47604b"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M173 78c0-14 22-15 22-1 0 9-11 8-11 18m0 0-54 34h107l-53-34Z"
        stroke="#47604b"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="m160 118-25 8-35 43 32 27 18-20-7 91h94l-7-91 18 20 32-27-35-43-26-8c-9 21-26 20-35 0h-24Z"
        fill="#b95336"
      />
      <path
        d="m172 118 13 25 13-24m-9 25v106"
        stroke="#e1a383"
        strokeWidth="3"
      />
      <path
        d="M303 79c0-14 22-15 22-1 0 9-11 8-11 18m0 0-54 34h107l-53-34Z"
        stroke="#47604b"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="m285 120-30 15-26 40 31 25 18-21-8 90h103l-8-90 16 20 29-26-26-39-29-14c-3 28-63 29-70 0Z"
        fill="#f2ddaa"
      />
      <path
        d="M278 185h88m-90 19h91m-93 19h95m-97 19h99"
        stroke="#7e8d66"
        strokeWidth="7"
      />
      <path d="m286 120 8 28h52l9-28" stroke="#7e8d66" strokeWidth="4" />
      <path
        d="m432 91 6-15 6 15 15 6-15 6-6 15-6-15-15-6 15-6Z"
        fill="#b95336"
      />
      <path
        d="m82 207 4-10 4 10 11 4-11 4-4 11-4-11-11-4 11-4Z"
        fill="#47604b"
      />
      <path d="M377 283c20-26 42-26 45-20-5 17-29 24-45 20Z" fill="#6b7955" />
      <path d="M397 284c-4-26 4-39 14-42 8 15 1 31-14 42Z" fill="#8e9e6e" />
    </svg>
  );
}

export function TogetherArt() {
  return (
    <svg viewBox="0 0 480 400" fill="none" aria-hidden="true">
      <circle cx="237" cy="205" r="154" fill="#e7b953" />
      <path
        d="M220 308s-102-60-102-127c0-54 69-70 102-21 33-49 102-33 102 21 0 67-102 127-102 127Z"
        fill="#bd613f"
      />
      <path
        d="m-9 224 88-25c23-7 42-3 60 7l48 29c12 9 4 24-10 19l-36-13 65 36c11 8 6 20-7 17l-53-25 46 29c9 8 3 20-9 15l-49-24 34 26c10 8 3 19-9 14l-48-25c-22-11-35-17-57-11l-53 16-10-85Z"
        fill="#d99978"
      />
      <path d="m-10 215 69-21 33 99-96 32-6-110Z" fill="#eef0d7" />
      <path
        d="m486 267-73-39c-24-12-43-13-65-5l-54 23c-13 6-8 22 6 20l40-8-70 26c-12 6-9 19 4 18l58-17-51 23c-11 7-6 20 6 16l53-17-38 22c-11 7-6 18 7 15l52-18c24-8 37-12 57-3l46 24 22-84Z"
        fill="#8f5038"
      />
      <path d="m488 250-60-29-43 90 95 47 8-108Z" fill="#456847" />
      <path
        d="m231 47 5-20m41 34 12-18m-93 16-11-18"
        stroke="#36533f"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="m366 116 7-19 7 19 19 7-19 7-7 19-7-19-19-7 19-7Z"
        fill="#36533f"
      />
      <path
        d="M112 98c-8-18-29-10-21 6 7 14 29 24 29 24s14-21 13-34c-2-17-23-14-21 4Z"
        fill="#36533f"
      />
      <path
        d="M180 355c31 12 65 14 98 6"
        stroke="#36533f"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
