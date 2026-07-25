export type Review = {
  id: string;
  learnerId: string;
  schoolId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateReviewPayload = {
  bookingId: string;
  rating: number;
  comment: string;
};

export type UpdateReviewPayload = {
  rating?: number;
  comment?: string;
};

export type SchoolReviewsResponse = {
  school: {
    id: string;
    name: string;
    ratingAverage: number;
    totalReviews: number;
  };
  items: Review[];
};
