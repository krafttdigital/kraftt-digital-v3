import type { ClientReview } from '../data/reviews';
import { ReviewsCarousel } from './ReviewsCarousel';

type ReviewsSectionProps = {
  reviews: ClientReview[];
  variant?: 'home' | 'project';
  projectName?: string;
};

export function ReviewsSection({
  reviews,
  variant = 'project',
  projectName,
}: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className={`client-reviews-section client-reviews-section-${variant}`} aria-labelledby={`client-reviews-${variant}-title`}>
      <div className="client-reviews-inner">
        <ReviewsCarousel reviews={reviews} variant={variant} projectName={projectName} />
      </div>
    </section>
  );
}
