export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ClientReview = {
  id: string;
  projectSlug: string;
  clientName: string;
  company: string;
  role: string;
  review: string;
  translation?: string;
  evidenceNote?: string;
  homepageExcerpt?: string;
  homepageTranslation?: string;
  sourceImages?: readonly { src: string; alt: string; label: string }[];
  rating: ReviewRating | null;
  featured: boolean;
};

export const reviews = [
  {
    id: 'shree-hari-spintex-satpal-goyal',
    projectSlug: 'shree-hari-spintex',
    clientName: 'Satpal Goyal',
    company: 'Shree Hari Spintex',
    role: 'Managing Director',
    review:
      'Purani website se humein koi fayda nahi ho raha tha; hum sirf maintenance bharte rahe. Nayi website se direct call enquiries aayi, almost ₹30 lakh ka stock sell hua, aur Google Maps aur website ke through mill tak pahunche ek client se crores ka bada order mila.',
    translation:
      'The old website was not helping us, though we kept paying for maintenance. The new site brought direct call enquiries, almost ₹30 lakh in stock sales, and an order worth crores from a customer who reached the mill through Google Maps and the website.',
    evidenceNote: 'Sales and order figures are client-reported and have not been independently verified.',
    homepageExcerpt:
      'Purani website se humein koi fayda nahi ho raha tha; hum sirf maintenance bharte rahe. Nayi website se direct call enquiries aayi…',
    homepageTranslation:
      'Our old website brought little value despite ongoing maintenance. The rebuilt site brought direct call enquiries.',
    rating: 5,
    featured: true,
  },
  {
    id: 'shree-hari-spintex-deepak-garg',
    projectSlug: 'shree-hari-spintex',
    clientName: 'Deepak Garg',
    company: 'Shree Hari Spintex',
    role: 'Managing Director',
    review:
      'Google Maps setup tha, lekin response nahi aa raha tha. Proper images, About, Services, website URL aur correct location add karne ke baad online visibility improve hui aur customers ke liye humein find karna easy ho gaya.',
    translation:
      'Our Google Maps listing was set up, but we were not getting a response. After adding proper images, About and Services information, the website URL and the correct location, visibility improved and customers could find us more easily.',
    rating: 5,
    featured: true,
  },
  {
    id: 'mittal-architect-neeraj-mittal',
    projectSlug: 'mittal-architect',
    clientName: 'Neeraj Mittal',
    company: 'Mittal Architect',
    role: 'Founder',
    review:
      "They translated my creativity and luxury-focused thinking into a premium website. Every project and its details are presented professionally, making my work easy to showcase. I'm very satisfied with the result.",
    rating: 5,
    featured: true,
  },
  {
    id: 'kiraq-jewellery-riya',
    projectSlug: 'kiraq-jewellery',
    clientName: 'Riya',
    company: 'Kiraq Jewellery',
    role: 'Co-Founder',
    review:
      "Working with them saved me thousands. They handled the website, product shoot and lifestyle-image needs I had budgeted around ₹25,000 for, while avoiding roughly ₹2,400 per month on Shopify. The overall investment was far below other agency quotes, with clear guidance on what I actually needed.",
    homepageExcerpt: 'Working with them saved me thousands. They handled the website, product shoot and lifestyle-image needs I had budgeted around ₹25,000 for…',
    rating: 5,
    featured: true,
  },
  {
    id: 'elixir-beverages-ayushman-mithal',
    projectSlug: 'elixir-beverages',
    clientName: 'Ayushman Mithal',
    company: 'Elixir Beverages',
    role: 'Client',
    review:
      'Handled my project very professionally and also assisted with us as a brother, we reached out for a 3D website but with proper guidence we got to know the importance of branding for our startup. Really appreciate!',
    homepageExcerpt: 'Handled my project very professionally… we reached out for a 3D website but with proper guidence we got to know the importance of branding for our startup.',
    rating: null,
    featured: true,
  },
  {
    id: 'elixir-beverages-yash-khandelwal',
    projectSlug: 'elixir-beverages',
    clientName: 'Yash Khandelwal',
    company: 'Elixir Beverages',
    role: 'Client',
    review: 'Thank you Ketan. Great work again!! Kraft digital 🔥🔥',
    sourceImages: [
      {
        src: '/assets/projects/elixir-beverages/elixir-yash-launch-feedback.png',
        alt: 'WhatsApp exchange in which Yash Khandelwal replies Great work after receiving the Elixir website link',
        label: 'Launch feedback',
      },
      {
        src: '/assets/projects/elixir-beverages/elixir-yash-feedback.png',
        alt: 'WhatsApp message from Yash Khandelwal thanking Kraftt Digital for the Elixir website work',
        label: 'Follow-up message',
      },
    ],
    rating: null,
    featured: true,
  },
] satisfies readonly ClientReview[];

export function reviewsForProject(projectSlug: string): ClientReview[] {
  return reviews.filter((review) => review.projectSlug === projectSlug);
}

export function featuredReviews(): ClientReview[] {
  return reviews.filter((review) => review.featured).sort((a, b) =>
    Number(Boolean(b.sourceImages?.length)) - Number(Boolean(a.sourceImages?.length)) ||
    Number(a.projectSlug === 'shree-hari-spintex') - Number(b.projectSlug === 'shree-hari-spintex'));
}
