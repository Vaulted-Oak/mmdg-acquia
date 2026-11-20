import Link from 'next/link';

/**
 * Site header from the Mark Morris Dance designs.
 *
 * Placeholder content: the announcement, opening hours and navigation are
 * hard-coded here until the site shell is modelled in Source.
 */

const NAV_ITEMS = [
  'About',
  'Shows & Works',
  'Space Rentals',
  'Classes',
  'Community Programs',
];

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' | 'down' }) {
  const paths = {
    left: 'm14 6-6 6 6 6',
    right: 'm10 6 6 6-6 6',
    down: 'm6 9 6 6 6-6',
  };
  return (
    <svg {...iconProps} width={14} height={14} strokeWidth={2.25}>
      <path d={paths[direction]} />
    </svg>
  );
}

function AnnouncementBar() {
  const arrowClass =
    'hidden size-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-ink sm:flex';
  return (
    <div className="border-b border-rule">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-2.5 lg:px-8">
        <span className={arrowClass}>
          <Chevron direction="left" />
        </span>
        <p className="flex-1 text-center text-sm sm:text-base">
          Studios and performance spaces available for rent in Brooklyn.{' '}
          <a href="#" className="ml-1 font-semibold whitespace-nowrap">
            Rent a Space <span aria-hidden="true">→</span>
          </a>
        </p>
        <span className={arrowClass}>
          <Chevron direction="right" />
        </span>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  return (
    <header className="text-ink">
      <AnnouncementBar />
      <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
        {/* Utility row */}
        <div className="flex items-center justify-between pt-6 lg:pt-7">
          <p className="text-sm sm:text-base">
            Dance Center Open Today: 9AM-9PM
          </p>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Search">
              <SearchIcon />
            </a>
            <a href="#" aria-label="Newsletter" className="hidden lg:block">
              <svg {...iconProps}>
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <path d="m3 6 9 7 9-7" />
              </svg>
            </a>
            <a href="#" aria-label="Calendar" className="hidden lg:block">
              <svg {...iconProps}>
                <rect x="3" y="5" width="18" height="16" rx="1" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
            </a>
            <Link
              href="/login"
              className="hidden items-center gap-1 font-bold lg:flex"
            >
              <svg {...iconProps}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
              </svg>
              Log in
            </Link>
          </div>
        </div>

        {/* Logo and navigation */}
        <div className="flex items-center justify-between gap-6 pt-2 pb-6 lg:pt-4">
          <Link
            href="/"
            className="font-display text-[2rem] leading-none font-light tracking-tight whitespace-nowrap uppercase sm:text-5xl 2xl:text-[3.25rem]"
          >
            Mark Morris Dance
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-base whitespace-nowrap xl:flex 2xl:gap-8 2xl:text-lg"
          >
            {NAV_ITEMS.map((item) => (
              <a key={item} href="#" className="flex items-center gap-1.5">
                {item}
                <Chevron direction="down" />
              </a>
            ))}
            <a
              href="#"
              className="bg-ink px-6 py-3 text-white hover:bg-neutral-700 2xl:px-8"
            >
              Visit
            </a>
            <a
              href="#"
              className="-ml-2 bg-brand px-6 py-3 text-white hover:bg-brand-dark 2xl:px-8"
            >
              Give
            </a>
          </nav>

          {/* Small screens: a simple disclosure menu */}
          <details className="group relative xl:hidden">
            <summary
              aria-label="Menu"
              className="flex cursor-pointer list-none flex-col gap-2 p-1 [&::-webkit-details-marker]:hidden"
            >
              <span className="block h-0.5 w-8 bg-ink" />
              <span className="block h-0.5 w-8 bg-ink" />
              <span className="block h-0.5 w-8 bg-ink" />
            </summary>
            <nav
              aria-label="Main navigation"
              className="absolute right-0 z-20 mt-3 flex w-64 flex-col gap-3 border border-rule bg-white p-5 text-lg shadow-lg"
            >
              {NAV_ITEMS.map((item) => (
                <a key={item} href="#">
                  {item}
                </a>
              ))}
              <Link href="/login" className="font-bold">
                Log in
              </Link>
              <a href="#" className="bg-ink px-4 py-2 text-center text-white">
                Visit
              </a>
              <a href="#" className="bg-brand px-4 py-2 text-center text-white">
                Give
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
