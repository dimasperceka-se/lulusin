export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

export function DotPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

export function FlowingRibbons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-accent/[0.08] dark:from-primary/5 dark:to-accent/5" />

      {/* Bottom-right flowing ribbons */}
      <svg
        className="absolute -bottom-10 -right-10 w-[900px] md:w-[1100px] h-[900px] md:h-[1100px] opacity-[0.18] dark:opacity-[0.10]"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M900 300C750 320 600 450 500 500C400 550 300 520 200 600C100 680 50 750 0 800"
          stroke="url(#ribbon1)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M900 300C750 320 600 450 500 500C400 550 300 520 200 600C100 680 50 750 0 800"
          stroke="url(#ribbon1)"
          strokeWidth="60"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M900 400C800 380 650 480 550 540C450 600 350 580 250 650C150 720 80 770 0 820"
          stroke="url(#ribbon2)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M900 400C800 380 650 480 550 540C450 600 350 580 250 650C150 720 80 770 0 820"
          stroke="url(#ribbon2)"
          strokeWidth="50"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M900 500C780 460 680 530 580 580C480 630 380 640 280 700C180 760 100 790 0 840"
          stroke="url(#ribbon3)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M900 500C780 460 680 530 580 580C480 630 380 640 280 700C180 760 100 790 0 840"
          stroke="url(#ribbon3)"
          strokeWidth="45"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        <defs>
          <linearGradient id="ribbon1" x1="0" y1="0" x2="900" y2="800">
            <stop offset="0%" stopColor="hsl(231, 58%, 36%)" />
            <stop offset="100%" stopColor="hsl(189, 55%, 51%)" />
          </linearGradient>
          <linearGradient id="ribbon2" x1="0" y1="0" x2="800" y2="800">
            <stop offset="0%" stopColor="hsl(189, 55%, 51%)" />
            <stop offset="100%" stopColor="hsl(231, 58%, 50%)" />
          </linearGradient>
          <linearGradient id="ribbon3" x1="0" y1="0" x2="700" y2="800">
            <stop offset="0%" stopColor="hsl(231, 58%, 36%)" />
            <stop offset="50%" stopColor="hsl(189, 55%, 51%)" />
            <stop offset="100%" stopColor="hsl(149, 42%, 74%)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top-left flowing ribbons (mirrored) */}
      <svg
        className="absolute -top-10 -left-10 w-[600px] md:w-[750px] h-[600px] md:h-[750px] opacity-[0.12] dark:opacity-[0.08] rotate-180"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M600 200C500 220 400 320 320 370C240 420 180 400 120 460C60 520 30 570 0 600"
          stroke="hsl(231, 58%, 36%)"
          strokeWidth="40"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M600 280C520 260 420 350 350 400C280 450 220 440 160 500C100 560 60 590 0 620"
          stroke="hsl(189, 55%, 51%)"
          strokeWidth="35"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
