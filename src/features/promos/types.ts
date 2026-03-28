export interface Promo {
  id: string;
  title: string;
  excerpt: string;
  thumbnail_url: string;
  content: string;
  type: "popup-promotion" | "promotion" | "announcement";
  is_published: boolean;
  published_at: string;
  created_at: string;
}
