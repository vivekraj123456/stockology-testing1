export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  publishedAt: string;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  author?: string | null;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BlogListResult {
  posts: BlogPost[];
  pagination: BlogPagination;
}
