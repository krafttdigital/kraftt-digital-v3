'use client';

import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown, Globe2, MapPin } from 'lucide-react';
import { addOnIds, formatPrice, formatServicePrice, geographicCurrency, isPricingCurrency, priceFor, pricingDestination, pricingExplanation, regionalizePriceCopy, type PriceId, type PricingCurrency } from '../data/pricing';
import { whatsappUrl } from '../data/site';

const preferenceKey = 'kraftt.pricing.currency';
const preferenceEvent = 'kraftt-pricing-change';
let sessionPreference: PricingCurrency | null = null;

function readPreference() {
  try {
    const value = localStorage.getItem(preferenceKey);
    if (isPricingCurrency(value)) return value;
  } catch { /* Session state works when browser storage is disabled. */ }
  return sessionPreference;
}

function rememberCurrency(currency: PricingCurrency) {
  sessionPreference = currency;
  try { localStorage.setItem(preferenceKey, currency); } catch { /* Use session state. */ }
  window.dispatchEvent(new Event(preferenceEvent));
}

function subscribe(listener: () => void) {
  window.addEventListener(preferenceEvent, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(preferenceEvent, listener);
    window.removeEventListener('storage', listener);
  };
}

const getServerPreference = () => null;
const PricingCurrencyContext = createContext<{ currency: PricingCurrency; select: (currency: PricingCurrency, atPackages?: boolean) => void }>({
  currency: 'INR',
  select: () => {},
});

export function PricingCurrencyProvider({ children, regionalPaths }: { children: ReactNode; regionalPaths: string[] }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const preference = useSyncExternalStore(subscribe, readPreference, getServerPreference);
  const routeCurrency = geographicCurrency(pathname);
  const currency = routeCurrency ?? preference ?? 'INR';

  useEffect(() => {
    if (!routeCurrency) return;
    rememberCurrency(routeCurrency);
    const hub = /^\/(?:region|location)\/[^/]+/.exec(pathname)?.[0];
    if (hub && regionalPaths.includes(hub)) {
      try { localStorage.setItem(`kraftt.pricing.hub.${routeCurrency}`, hub); } catch { /* The service page remains available. */ }
    }
  }, [pathname, regionalPaths, routeCurrency]);

  function select(next: PricingCurrency, atPackages?: boolean) {
    let hub = null;
    try { hub = localStorage.getItem(`kraftt.pricing.hub.${next}`); } catch { /* No saved hub. */ }
    rememberCurrency(next);
    const destination = pricingDestination(pathname, next, hub, regionalPaths);
    if (destination && destination !== pathname) {
      const packages = atPackages || window.location.hash === '#packages';
      router.push(destination + (packages ? '#packages' : ''));
    }
  }

  return <PricingCurrencyContext.Provider value={{ currency, select }}>{children}</PricingCurrencyContext.Provider>;
}

export function usePricingCurrency() {
  return useContext(PricingCurrencyContext).currency;
}

const regions = [
  { currency: 'INR', label: 'India', icon: MapPin },
  { currency: 'USD', label: 'International', icon: Globe2 },
] as const;

export function RegionCurrencySelect({ placement = 'pricing' }: { placement?: 'header' | 'mobile' | 'pricing' }) {
  const { currency, select } = useContext(PricingCurrencyContext);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const firstFocus = useRef(0);
  const current = currency === 'INR' ? 0 : 1;
  const { label, icon: RegionIcon } = regions[current];

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelectorAll<HTMLButtonElement>('button')[firstFocus.current]?.focus();

    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    function dismissWithEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      trigger.current?.focus();
      setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss, true);
    document.addEventListener('keydown', dismissWithEscape, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss, true);
      document.removeEventListener('keydown', dismissWithEscape, true);
    };
  }, [open]);

  function show(index: number) {
    firstFocus.current = index;
    setOpen(true);
  }

  function close() {
    trigger.current?.focus();
    setOpen(false);
  }

  function handleMenuKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      close();
      return;
    }

    const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const active = items.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case 'ArrowDown': next = (active + 1) % items.length; break;
      case 'ArrowUp': next = (active + items.length - 1) % items.length; break;
      case 'Home': next = 0; break;
      case 'End': next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    items[next]?.focus();
  }

  return (
    <div ref={root} className={`region-currency-select region-currency-${placement}`} onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      {placement !== 'header' && <span className="region-currency-label" aria-hidden="true">Region &amp; currency</span>}
      <button ref={trigger} type="button" className="region-currency-input"
        aria-label={`Region & currency: ${label}, ${currency}`} aria-haspopup="menu"
        aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => open ? close() : show(current)} onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            show(event.key === 'ArrowDown' ? 0 : regions.length - 1);
          }
        }}>
        <span className="region-currency-icon" aria-hidden="true"><RegionIcon size={15} /></span>
        <span className="region-currency-value" aria-hidden="true">
          {label}
          <span className="region-currency-code">{currency}</span>
        </span>
        <ChevronDown className="region-currency-chevron" size={14} aria-hidden="true" />
      </button>
      {open && <div ref={menu} id={menuId} className="region-currency-menu" role="menu" aria-label="Region & currency" onKeyDown={handleMenuKey}>
        {regions.map(({ currency: choice, label: name, icon: Icon }) => (
          <button key={choice} type="button" className="region-currency-option" role="menuitemradio"
            aria-checked={choice === currency} tabIndex={-1} onClick={() => {
              close();
              if (choice !== currency) select(choice, Boolean(root.current?.closest('#packages')));
            }}>
            <span className="region-currency-icon" aria-hidden="true"><Icon size={15} /></span>
            <span className="region-currency-value">{name}<span className="region-currency-code">{choice}</span></span>
            <span className="region-currency-selection-mark" aria-hidden="true">{choice === currency && <Check size={13} strokeWidth={2.5} />}</span>
          </button>
        ))}
      </div>}
    </div>
  );
}

export function PricingControls() {
  const currency = usePricingCurrency();
  return <div className="regional-pricing-controls">
    <RegionCurrencySelect />
    <p>{pricingExplanation}</p>
    <span className="sr-only" role="status">{currency === 'INR' ? 'Showing India prices in INR.' : 'Showing international prices in USD.'}</span>
  </div>;
}

export function RegionalPriceCopy({ children }: { children: string }) {
  return <>{regionalizePriceCopy(children, usePricingCurrency(), formatServicePrice)}</>;
}

export function PriceText({ id, from = false }: { id: PriceId | null; from?: boolean }) {
  return <>{formatServicePrice(id, usePricingCurrency(), from)}</>;
}

export function PackageAddOns({ id, quoted = [] }: { id: PriceId | null; quoted?: string[] }) {
  const currency = usePricingCurrency();
  const items = addOnIds(id).map(addOn => ({ name: priceFor(addOn, currency).name, price: formatServicePrice(addOn, currency) }));
  items.push(...quoted.map(name => ({ name, price: formatPrice(null, currency) })));
  if (!items.length) return null;
  return <details className="regional-addons"><summary>Optional add-ons <span aria-hidden="true">+</span></summary>
    <ul>{items.map(item => <li key={item.name}><span>{item.name} — {item.price}</span></li>)}</ul>
  </details>;
}

export function PricingWhatsApp({ message, id, children, className }: { message: string; id?: PriceId | null; children: ReactNode; className?: string }) {
  const currency = usePricingCurrency();
  const region = currency === 'INR' ? 'India · INR' : 'International · USD';
  const investment = id === undefined ? '' : `\nPrice: ${formatPrice(id, currency, true)}.`;
  return <a className={className} href={whatsappUrl(`${message}\nPricing region: ${region}.${investment}`)}>{children}</a>;
}

export function CurrencySymbol() {
  return <>{usePricingCurrency() === 'INR' ? '₹' : 'US$'}</>;
}
