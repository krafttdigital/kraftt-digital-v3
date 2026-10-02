export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ClientReview = {
  id: string;
  projectSlug: string;
  clientName: string;
  company: string;
  role: string;
  review: string;
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
    rating: 5,
    featured: true,
  },
] satisfies readonly ClientReview[];

export function reviewsForProject(projectSlug: string): ClientReview[] {
  return reviews.filter((review) => review.projectSlug === projectSlug);
}

export function featuredReviews(): ClientReview[] {
  return reviews.filter((review) => review.featured);
}
