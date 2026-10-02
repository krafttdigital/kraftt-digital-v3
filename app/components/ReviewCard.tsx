import Link from 'next/link';
import type { ClientReview } from '../data/reviews';

function ReviewStars({ rating }: { rating: ClientReview['rating'] }) {
  const ratingLabel = rating === null
    ? 'Star rating pending client confirmation'
    : `${rating} out of 5 stars`;

  return (
    <div className="client-review-stars" role="img" aria-label={ratingLabel}>
      <span className="client-review-star-row" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span className={rating !== null && star <= rating ? 'is-filled' : ''} key={star}>
            {rating !== null && star <= rating ? '★' : '☆'}
          </span>
        ))}
      </span>
      <span>{rating === null ? 'Rating pending' : `${rating} / 5 client rating`}</span>
    </div>
  );
}

export function ReviewCard({
  review,
  showProjectLink = false,
  index,
}: {
  review: ClientReview;
  showProjectLink?: boolean;
  index: number;
}) {
  const reviewerId = `reviewer-${review.id}`;

  return (
    <article className="client-review-card" aria-labelledby={reviewerId}>
      <div className="client-review-card-topline">
        <span>{review.company}</span>
        <span>0{index + 1}</span>
      </div>

      <blockquote>
        <p>{review.review}</p>
      </blockquote>

      <footer>
        <div className="client-review-person">
          <span aria-hidden="true" />
          <div>
            <strong id={reviewerId}>{review.clientName}</strong>
            <span>{review.role} · {review.company}</span>
          </div>
        </div>
        <div className="client-review-proof">
          <ReviewStars rating={review.rating} />
          {showProjectLink && (
            <Link href={`/work/${review.projectSlug}`}>
              View case study <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
