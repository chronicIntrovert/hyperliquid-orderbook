import type { FC } from 'react'

/**
 * Transparent overlay with the Fullstack logo (shimmer effect) and label,
 * shown while the orderbook is waiting for its first WebSocket snapshot.
 * Sits on top of the placeholder rows so the layout stays stable.
 */
export const LoadingOverlay: FC = () => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-panel/80 backdrop-blur-[1px]">
    <FullstackLogoShimmer />
    <span className="text-xs tracking-wide text-muted animate-pulse">
      Connecting to orderbook...
    </span>
  </div>
)

/**
 * Fullstack logo with a sweeping shimmer highlight.
 * Uses an inline SVG with a gradient mask that animates left-to-right
 * to create a metallic shimmer on the logo shape.
 */
const FullstackLogoShimmer: FC = () => (
  <div className="relative h-12 w-24">
    {/* Base logo at low opacity */}
    <svg
      className="absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 125 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <FullstackPaths fill="#F54900" />
    </svg>

    {/* Shimmer layer: clips the gradient sweep to the logo shape */}
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 125 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shimmer-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F54900" stopOpacity="0" />
          <stop offset="40%" stopColor="#F54900" stopOpacity="0" />
          <stop offset="50%" stopColor="#FF8A50" stopOpacity="1" />
          <stop offset="60%" stopColor="#F54900" stopOpacity="0" />
          <stop offset="100%" stopColor="#F54900" stopOpacity="0" />
        </linearGradient>

        {/* Animated rectangle that sweeps the gradient across the logo */}
        <mask id="shimmer-mask">
          <rect
            x="-125"
            y="0"
            width="250"
            height="66"
            fill="url(#shimmer-grad)"
          >
            <animate
              attributeName="x"
              from="-125"
              to="125"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        </mask>
      </defs>

      <g mask="url(#shimmer-mask)">
        <FullstackPaths fill="#F54900" />
      </g>
    </svg>
  </div>
)

/** The three path shapes of the Fullstack icon, extracted for reuse. */
const FullstackPaths: FC<{ fill: string }> = ({ fill }) => (
  <>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M41.1479 1.06254L30.8271 11.3828C30.4776 11.7135 30.2599 12.1823 30.2599 12.7005C30.2599 13.7025 31.0719 14.5145 32.074 14.5145L46.7115 14.5156C47.8027 14.5156 48.7818 14.0333 49.4464 13.2708L59.5369 3.19266C59.9219 2.8604 60.1656 2.3688 60.1656 1.82027C60.1656 0.818267 59.3531 0.00573207 58.3522 0.00573207H43.9235C43.8542 0.00213207 43.7839 2.8997e-06 43.7136 2.8997e-06C42.7115 2.8997e-06 41.8047 0.406269 41.1479 1.06254Z"
      fill={fill}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M122.909 7.26093C123.911 7.26093 124.723 8.07293 124.723 9.074C124.723 9.57546 124.52 10.0287 124.191 10.3568L110.317 24.2249C109.655 24.9464 108.703 25.3973 107.645 25.3973H57.2297C54.3427 25.3932 51.5734 26.5407 49.5344 28.5855L35.7833 42.3276C35.1114 43.0708 34.1344 43.538 33.0521 43.5391C32.9932 43.5391 31.8 43.5369 31.7417 43.5349H13.3338C12.3109 43.5349 11.4995 42.7229 11.4995 41.7208C11.4995 41.1995 11.7197 40.7287 12.0724 40.3979L29.489 23.0016C30.153 22.2464 31.1276 21.7697 32.2125 21.7697H46.7136C49.6005 21.7735 52.3693 20.626 54.4084 18.5828C60.5312 12.4588 64.5516 8.43853 64.5516 8.43853C65.214 7.71506 66.1677 7.26093 67.227 7.26093H122.909Z"
      fill={fill}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M33.0833 50.7891H13.4385C12.4953 50.7891 11.636 51.1489 10.9907 51.7396L4.686 58.0437L0.562 62.1677L0.5604 62.1692C0.215067 62.4995 0 62.9651 0 63.4801C0 64.4823 0.812533 65.2948 1.814 65.2948L7.6912 65.2989H12.8208H23.0803H28.2109H38.4703H42.0875H43.5943L50.8495 58.0437L58.1036 50.7891L61.7307 47.1625H66.8667H77.1265H87.3869L88.4219 46.1265L88.5317 46.0177L88.6036 45.9396L91.0145 43.5349L98.2688 36.2801L98.8651 35.6807C99.1552 35.3593 99.3323 34.9323 99.3323 34.4656C99.3323 33.4828 98.5511 32.6828 97.5771 32.6525H91.636H81.3765H76.2401H71.1167H67.4921H60.8568L60.836 32.6609H57.2208C56.2385 32.6609 55.3473 33.0516 54.6948 33.6849L54.6901 33.6896L54.6391 33.7401L52.0995 36.2801L47.4084 40.9713L44.8448 43.5349L41.2172 47.1625H41.1932C39.2011 49.3875 36.3057 50.7885 33.0833 50.7891Z"
      fill={fill}
    />
  </>
)
