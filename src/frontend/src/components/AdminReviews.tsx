import { Loader2, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useDeleteReview, useGetAllReviews } from "../hooks/useReviews";
import { StarRatingDisplay } from "./StarRating";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface AdminReviewsProps {
  products?: Product[];
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

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminReviews({ products }: AdminReviewsProps) {
  const { data: reviews, isLoading } = useGetAllReviews();
  const deleteReview = useDeleteReview();
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);

  const handleDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await deleteReview.mutateAsync(deleteConfirmId);
      toast.success("Review deleted");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
    }
  };

  const getProductName = (productId: bigint) => {
    const product = products?.find((p) => p.id === productId);
    return product?.name ?? `Product #${productId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12" data-ocid="admin_reviews.empty_state">
        <Star className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-display font-bold mb-1">
          Customer Reviews
        </h2>
        <p className="text-muted-foreground text-sm">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} across all
          products
        </p>
      </div>

      <div
        className="rounded-lg border border-primary/20 overflow-hidden"
        data-ocid="admin_reviews.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review, idx) => (
              <TableRow
                key={review.reviewId.toString()}
                className="hover:bg-primary/5 transition-colors"
                data-ocid={`admin_reviews.row.${idx + 1}`}
              >
                <TableCell className="font-medium">
                  {getProductName(review.productId)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {truncatePrincipal(review.customerPrincipal as any)}
                </TableCell>
                <TableCell>
                  <StarRatingDisplay rating={Number(review.rating)} size="sm" />
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm truncate">
                    {review.comment || (
                      <span className="text-muted-foreground italic">
                        No comment
                      </span>
                    )}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(review.timestamp)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmId(review.reviewId)}
                    data-ocid={`admin_reviews.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent data-ocid="admin_reviews.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin_reviews.cancel_button"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin_reviews.confirm_button"
            >
              {deleteReview.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
