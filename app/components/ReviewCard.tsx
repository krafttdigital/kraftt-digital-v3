import Link from 'next/link';
import type { ClientReview } from '../data/reviews';
import { projectBySlug } from '../data/projects';

function ReviewStars({ rating }: { rating: Exclude<ClientReview['rating'], null> }) {
  return (
    <div className="client-review-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      <span className="client-review-star-row" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span className={star <= rating ? 'is-filled' : ''} key={star}>
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </span>
      <span>{rating} / 5 client rating</span>
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
        <span>Client review · {review.company}</span>
        <span>0{index + 1}</span>
      </div>

      <blockquote>
        <p>{review.review}</p>
        {review.translation && <p><strong>English translation:</strong> {review.translation}</p>}
      </blockquote>
      {review.evidenceNote && <p className="client-review-evidence-note">{review.evidenceNote}</p>}

      <footer>
        <div className="client-review-person">
          <span aria-hidden="true" />
          <div>
            <strong id={reviewerId}>{review.clientName}</strong>
            <span>{review.role} · {review.company}</span>
            {projectBySlug(review.projectSlug)?.relationshipLabel && <span>{projectBySlug(review.projectSlug)?.relationshipLabel}</span>}
          </div>
        </div>
        <div className="client-review-proof">
          {review.rating !== null && <ReviewStars rating={review.rating} />}
          {review.sourceImages?.map((source) => <a key={source.src} href={source.src} target="_blank" rel="noopener noreferrer">View {source.label.toLowerCase()} <span aria-hidden="true">↗</span></a>)}
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
