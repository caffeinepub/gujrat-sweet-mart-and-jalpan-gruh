import { ChevronDown, ChevronUp, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetOrders } from "../hooks/useOrders";
import {
  type Review,
  useGetReviewsForProduct,
  useSubmitReview,
} from "../hooks/useReviews";
import { StarRatingDisplay, StarRatingInput } from "./StarRating";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

interface ProductReviewsProps {
  productId: bigint;
  productName: string;
}

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncatePrincipal(
  principal: { toText?: () => string } | string,
): string {
  const text =
    typeof principal === "string"
      ? principal
      : typeof principal?.toText === "function"
        ? principal.toText()
        : String(principal);
  if (text.length <= 16) return text;
  return `${text.slice(0, 8)}...${text.slice(-6)}`;
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const { identity } = useInternetIdentity();
  const { data: reviews, isLoading } = useGetReviewsForProduct(productId);
  const { data: myOrders } = useGetOrders();
  const submitReview = useSubmitReview();

  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const myPrincipal = identity?.getPrincipal();
  const myPrincipalText = myPrincipal?.toText();

  // Check if current user has a delivered order with this product
  const hasDeliveredOrderWithProduct =
    myOrders?.some(
      (order) =>
        order.status === OrderStatus.delivered &&
        order.items.some((item) => item.productId === productId),
    ) ?? false;

  // Find existing review from current user
  const myExistingReview = reviews?.find((r) => {
    const rText =
      typeof r.customerPrincipal?.toText === "function"
        ? r.customerPrincipal.toText()
        : String(r.customerPrincipal);
    return rText === myPrincipalText;
  });

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0;

  const handleOpenForm = () => {
    if (myExistingReview) {
      setRating(Number(myExistingReview.rating));
      setComment(myExistingReview.comment);
    }
    setShowForm(true);
    setExpanded(true);
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating (1-5 stars)");
      return;
    }

    try {
      await submitReview.mutateAsync({
        productId,
        rating: BigInt(rating),
        comment: comment.trim(),
      });
      toast.success(
        myExistingReview ? "Review updated!" : "Review submitted! Thank you.",
      );
      setShowForm(false);
      setComment("");
      setRating(5);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="mt-3 border-t border-primary/10 pt-3">
      {/* Summary line */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left group"
        data-ocid="review.panel"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {reviews && reviews.length > 0 ? (
            <>
              <StarRatingDisplay
                rating={averageRating}
                size="sm"
                showCount={true}
                count={reviews.length}
              />
              <span className="text-xs text-muted-foreground">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              No reviews yet
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
          {expanded ? (
            <>
              Hide <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Reviews <ChevronDown className="h-3 w-3" />
            </>
          )}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Review form trigger */}
          {identity && hasDeliveredOrderWithProduct && !showForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenForm}
              className="w-full text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
              data-ocid="review.open_modal_button"
            >
              {myExistingReview ? "✏️ Edit Your Review" : "⭐ Write a Review"}
            </Button>
          )}

          {/* Review submission form */}
          {showForm && identity && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3"
              data-ocid="review.modal"
            >
              <h4 className="font-semibold text-sm text-amber-900">
                {myExistingReview ? "Edit Your Review" : "Write a Review"} for{" "}
                {productName}
              </h4>
              <div>
                <p className="text-xs text-amber-700 mb-2">Your Rating:</p>
                <StarRatingInput
                  value={rating}
                  onChange={setRating}
                  size="md"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-sm resize-none"
                  rows={3}
                  data-ocid="review.textarea"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitReview.isPending || rating === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  data-ocid="review.submit_button"
                >
                  {submitReview.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : myExistingReview ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-amber-300"
                  data-ocid="review.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Reviews list */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
              {reviews.map((review: Review, idx: number) => {
                const principalText =
                  typeof review.customerPrincipal?.toText === "function"
                    ? review.customerPrincipal.toText()
                    : String(review.customerPrincipal);
                const isMyReview = principalText === myPrincipalText;

                return (
                  <div
                    key={review.reviewId.toString()}
                    className={`rounded-lg p-3 text-sm ${
                      isMyReview
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-muted/30 border border-border/50"
                    }`}
                    data-ocid={`review.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <StarRatingDisplay
                            rating={Number(review.rating)}
                            size="sm"
                          />
                          {isMyReview && (
                            <span className="text-xs text-amber-600 font-semibold">
                              Your review
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {truncatePrincipal(review.customerPrincipal as any)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(review.timestamp)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-foreground/80 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4" data-ocid="review.empty_state">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No reviews yet. Be the first to review!
              </p>
            </div>
          )}

          {/* Prompt to login or buy first */}
          {!identity && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Login to write a review
            </p>
          )}
          {identity && !hasDeliveredOrderWithProduct && !myExistingReview && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Purchase & receive this product to leave a review
            </p>
          )}
        </div>
      )}
    </div>
  );
}
