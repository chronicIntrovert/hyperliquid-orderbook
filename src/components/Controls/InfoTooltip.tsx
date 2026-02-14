import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Drawer } from 'vaul'

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(max-width: 767px)')
    setIsMobile(m.matches)
    const listener = (): void => setIsMobile(m.matches)
    m.addEventListener('change', listener)
    return () => m.removeEventListener('change', listener)
  }, [])
  return isMobile
}

const DESKTOP_BUTTON_SIZE = 'h-5 w-5'

/** Button that toggles the legend. On mobile: larger tap target and icon. Highlights (ring) only when open. */
export const InfoButton: FC<{
  open: boolean
  onToggle: () => void
  isMobile?: boolean
}> = ({ open, onToggle, isMobile = false }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label="Orderbook legend"
    aria-expanded={open}
    className={`flex items-center justify-center rounded-full border transition-colors hover:border-secondary hover:text-secondary focus:outline-none focus:ring-0 ${isMobile ? 'min-h-[24px] min-w-[24px]' : DESKTOP_BUTTON_SIZE
      } ${open
        ? 'border-secondary text-secondary ring-2 ring-secondary/50 ring-offset-2 ring-offset-panel'
        : 'border-elevated text-muted'
      }`}
  >
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
        clipRule="evenodd"
      />
    </svg>
  </button>
)

const DRAWER_CONTENT_CLASS =
  'flex flex-1 flex-col min-h-0 rounded-t-xl border-elevated bg-panel shadow-xl outline-none'

/** Scrollable area for legend content. data-vaul-no-drag so only the handle closes the drawer on drag. */
const LegendScrollArea: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    data-vaul-no-drag
    className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 text-sm leading-relaxed text-secondary sm:text-xs ${className}`}
    role="region"
    aria-label="Legend content"
  >
    {children}
  </div>
)

import { InfoTooltipContent } from './InfoTooltipContent'

/**
 * Legend panel: Vaul drawer only.
 * - Desktop: side drawer from the left (direction="left").
 * - Mobile: bottom drawer at ~2/3 viewport height so orderbook remains partially visible; drag handle to close.
 */
export const InfoLegend: FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
}> = ({ open, onOpenChange }) => {
  const isMobile = useIsMobile()

  const drawerContent = (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]" />
      <Drawer.Content
        className={`fixed z-50 flex flex-col outline-none ${isMobile
            ? 'bottom-0 left-0 right-0 max-h-[66dvh] rounded-t-xl border border-b border-bg-tertiary bg-bg-secondary/95 backdrop-blur-sm'
            : 'left-0 top-0 h-full w-[min(20rem,100vw-2rem)] max-w-full border-r border-bg-tertiary bg-bg-secondary'
          } ${DRAWER_CONTENT_CLASS}`}
      >
        <Drawer.Handle className="my-4" />
        <Drawer.Title className="sr-only">Orderbook Legend</Drawer.Title>
        <Drawer.Description className="sr-only">
          Legend for orderbook columns, depth bars, row flashes, and spread.
        </Drawer.Description>
        <LegendScrollArea>
          <InfoTooltipContent />
        </LegendScrollArea>
      </Drawer.Content>
    </Drawer.Portal>
  )

  const rootProps = {
    open,
    onOpenChange,
    modal: true as const,
    dismissible: true,
    noBodyStyles: true,
    setBackgroundColorOnScale: false as const,
  }

  return (
    <>
      <div className="flex">
        <InfoButton open={open} onToggle={() => onOpenChange(!open)} isMobile={isMobile} />
      </div>

      {isMobile ? (
        <Drawer.Root
          {...rootProps}
          direction="bottom"
          snapPoints={[0, 1]}
          activeSnapPoint={open ? 1 : 0}
          setActiveSnapPoint={(point) => {
            if (point === 0) onOpenChange(false)
          }}
          fadeFromIndex={1}
        >
          {drawerContent}
        </Drawer.Root>
      ) : (
        <Drawer.Root {...rootProps} direction="left">
          {drawerContent}
        </Drawer.Root>
      )}
    </>
  )
}
