import axios from 'axios';

interface EventResponse {
    events: Event[];
    rest_url: string;
    total: number;
    total_pages: number;
}

type Organizer = "BISO Bergen" | "BISO Oslo" | "BISO Stavanger" | "BISO Trondheim" | "BISO National"

interface Category {
    count: number;
    description: string;
    filter: string;
    id: number;
    name: string;
    parent: number;
    slug: string;
    taxonomy: string;
    term_group: number;
    term_taxonomy_id: number;
    urls: Object[];
}

interface CostDetails {
    currency_code: string;
    currency_position: string;
    currency_symbol: string;
    values: string[];
}

interface DateDetails {
    day: string;
    hour: string;
    minutes: string;
    month: string;
    seconds: string;
    year: string;
}

interface OrganizerProps {
    author: string;
    date: string;
    date_utc: string;
    global_id: string;
    global_id_lineage: string[];
    id: number;
    modified: string;
    modified_utc: string;
    organizer: Organizer;
    slug: string;
    status: string;
    url: string;
}

export interface Event {
    all_day: boolean;
    author: string;
    categories: Category[];
    cost: string;
    cost_details: CostDetails;
    date: string;
    date_utc: string;
    description: string;
    end_date: string;
    end_date_details: DateDetails;
    excerpt: string;
    featured: boolean;
    global_id: string;
    global_id_lineage: string[];
    hide_from_listings: boolean;
    id: number;
    image: string;
    modified: string;
    modified_utc: string;
    organizer: OrganizerProps[];
    rest_url: string;
    show_map: boolean;
    show_map_link: boolean;
    slug: string;
    start_date: string;
    start_date_details: DateDetails;
    status: string;
    sticky: boolean;
    tags: any[]; // Replace 'any' with a more specific type if the structure of tags is known
    timezone: string;
    timezone_abbr: string;
    title: string;
    url: string;
    utc_end_date: string;
    utc_end_date_details: DateDetails;
    utc_start_date: string;
    utc_start_date_details: DateDetails;
    venue: any[]; // Replace 'any' with a more specific type if the structure of venue is known
    website: string;
}
export const getEvents = async (campus?: string) => {
    const { data } = await axios.get('https://biso.no/wp-json/tribe/events/v1/events');
    

    // Remove quotes from campus
    campus = campus?.replace(/"/g, '');

    return data.events.filter((event: Event) => {
        const campusWithPrenoun = "BISO " + campus;
        return event.organizer[0].organizer === campusWithPrenoun;
    })
    .map((event: Event) => {
        // Remove HTML tags from the event description
        const sanitizedDescription = event.description.replace(/<[^>]*>/g, '');
        
        // Return only the first 50 characters of the description
        const truncatedDescription = sanitizedDescription.substring(0, 50);
        
        // Return the event with the truncated description
        return {
            ...event,
            description: truncatedDescription
        } satisfies Event;
    });
}