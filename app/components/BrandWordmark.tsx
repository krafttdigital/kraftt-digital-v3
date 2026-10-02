export function BrandWordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand-wordmark${inverse ? ' brand-wordmark-inverse' : ''}`} aria-hidden="true">
      <span>Kraftt<b>.</b></span>
      <small>Digital</small>
    </span>
  );
}
