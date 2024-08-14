import { AgendaCalendar } from "@/components/explore/agenda-list";
import { MyStack } from "@/components/ui/MyStack";

export default function EventsScreen() {
    return (
        
        <AgendaCalendar items={[
        { title: '2024-08-01', data: [{ name: 'Event 1' }, { name: 'Event 2' }] },
        ]}
    />
    );
}