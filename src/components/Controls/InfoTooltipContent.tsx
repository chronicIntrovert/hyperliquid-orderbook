import type { FC } from 'react'

const Section: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-2 border-t border-elevated pt-2">
    <h5 className="mb-1 font-medium text-primary">{title}</h5>
    <dl className="space-y-1">{children}</dl>
  </div>
)

const Bid: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-medium text-bid">{children}</span>
)

const Ask: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-medium text-ask">{children}</span>
)

/** Legend copy: columns, depth bars, row flashes, spread. Used inside the info drawer. */
export const InfoTooltipContent: FC = () => (
  <>
    <h4 className="mb-2 text-sm font-semibold text-primary">
      Orderbook Legend
    </h4>
    <Section title="Columns">
      <dt className="text-primary">Price</dt>
      <dd>
        The aggregated price level. <Bid>Green</Bid> = bids (buy
        orders), <Ask>red</Ask> = asks (sell orders).
      </dd>
      <dt className="text-primary">Size</dt>
      <dd>
        Quantity at that price level, in the selected coin (BTC or ETH).
      </dd>
      <dt className="text-primary">Total</dt>
      <dd>
        Cumulative size from the best price outward, in the selected coin.
        Shows how much liquidity you&apos;d need to consume to reach that level.
      </dd>
    </Section>
    <Section title="Depth Bars">
      <dd>
        The horizontal bars behind each row represent the
        cumulative <em>Total</em> as a percentage of the
        side&apos;s maximum. Longer bar = more cumulative liquidity
        at that level.{' '}
        <Bid>Green</Bid> bars for bids,{' '}
        <Ask>red</Ask> bars for asks.
      </dd>
    </Section>
    <Section title="Row Flashes">
      <dd>
        Rows flash on any change to size or price level: size increased or
        decreased, new level appeared, or level removed. <Bid>Bid</Bid> rows
        flash <Bid>green</Bid>; <Ask>ask</Ask> rows flash <Ask>red</Ask>.
      </dd>
      <dt>
        <span className="inline-block h-2 w-2 rounded-sm bg-bid-flash" />{' '}
        <Bid>Bid</Bid> flash
      </dt>
      <dd>A bid level changed (size or price).</dd>
      <dt>
        <span className="inline-block h-2 w-2 rounded-sm bg-ask-flash" />{' '}
        <Ask>Ask</Ask> flash
      </dt>
      <dd>An ask level changed (size or price).</dd>
    </Section>
    <Section title="Spread">
      <dd>
        The gap between the best ask (lowest sell) and best bid
        (highest buy). A tight spread = liquid market; a wide
        spread = illiquid or volatile.
      </dd>
    </Section>
  </>
)
