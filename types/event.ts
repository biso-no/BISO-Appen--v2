export interface Event {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    end_date: string;
    venue: string | null;
    url: string;
    featured_image: string;
  }