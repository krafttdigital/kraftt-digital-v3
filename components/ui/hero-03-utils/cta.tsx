import Link from 'next/link';
import { Button } from '@/components/ui/button';

export type CtaProps = {
  ctaEnabled: boolean;
  text: string;
  link: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function Cta({ cta }: { cta: CtaProps }) {
  return (
    <Button asChild variant={cta.variant} size={cta.size}>
      <Link href={cta.link}>{cta.text}</Link>
    </Button>
  );
}
