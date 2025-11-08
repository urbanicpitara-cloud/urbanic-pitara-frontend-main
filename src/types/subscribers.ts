export interface Subscriber {
  id: string;
  email: string;
  source?: string;
  createdAt: string;
  verified: boolean;
}

export interface SubscriberResponse {
  data: Subscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}