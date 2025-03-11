interface Thumbnail {
  id: number;
  url: string;
  width: number;
  height: number;
}

interface Organizer {
  id: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  slug: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  phone: string;
  website: string;
  slug: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  cost: string;
  website: string;
  thumbnail: Thumbnail;
  organizer: Organizer;
  venue: Venue;
  categories: string[];
  tags: string[];
}

// Use this type for an array of events
type EventList = Event[];