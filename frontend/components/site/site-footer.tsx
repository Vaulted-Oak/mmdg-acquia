/**
 * Site footer from the Mark Morris Dance designs.
 *
 * Placeholder content: the columns and links are hard-coded here until the
 * site shell is modelled in Source.
 */

const COLUMNS = [
  {
    heading: 'Experience',
    links: ['Performances', 'Classes', 'Studios and Spaces', 'Programs', 'Archive'],
  },
  {
    heading: 'Learn',
    links: [
      'Dance Group and Music Ensemble',
      'Dance Center',
      'Dance for Health',
      'Mission and Values',
    ],
  },
  {
    heading: 'Support Us',
    links: ['Give', 'Membership', 'Shop'],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-12 lg:flex-row lg:gap-16 lg:px-8">
        {/* Stands in for the circular photo of the Dance Center. */}
        <div className="hidden shrink-0 lg:block lg:w-[22rem] lg:border-r lg:border-rule">
          <div
            role="img"
            aria-label="Mark Morris Dance Center"
            className="size-56 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400"
          />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="font-display text-3xl lg:text-4xl">
                {column.heading}
              </h2>
              <ul className="mt-6 flex flex-col gap-4 text-lg">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
