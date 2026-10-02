export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://krafttdigital.in';

export const contactEmail = 'hello@krafttdigital.in';
export const contactPhone = '+91 79867 69102';
export const contactPhoneHref = 'tel:+917986769102';
export const contactWhatsAppNumber = '917986769102';

export const whatsappUrl = (message: string) =>
  `https://wa.me/${contactWhatsAppNumber}?text=${encodeURIComponent(message)}`;

export const navItems = [
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/process', label: 'Our Process' },
  { href: '/about', label: 'About' },
  // { href: '/contact', label: 'Contact' },
  { href: '/tools', label: 'Tools' },
];
