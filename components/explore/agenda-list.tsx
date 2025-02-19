import React, { useRef, useCallback, useState, useEffect } from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { Models, Query } from 'react-native-appwrite';
import { ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { useTheme, Card, H5, H3, XStack, YStack, Image, Separator } from 'tamagui';
import { databases } from '@/lib/appwrite';
import { format, parseISO } from 'date-fns';
import { useCampus } from '@/lib/hooks/useCampus';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';

const getFormattedDateFromString = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd'); // or any desired format
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

const AgendaItem = ({ item }: { item: Models.Document }) => {
  const { push } = useRouter();

  const formattedDate = getFormattedDateFromString(item.$createdAt);

  return (
    <Card chromeless padding="$4" marginBottom="$2" onPress={() => push("/explore/events/" + item.$id)} width={400}>
      <Card.Header height={130}>
        <Image source={{ uri: item?.image }} alt="image" height={200} width="100%" borderRadius="$2" />
      </Card.Header>
      <Card.Footer>
        <YStack gap="$1">
          <H5>{item?.title} - {item?.campus}</H5>
          <XStack justifyContent="space-between">
            <H3>{formattedDate}</H3>
          </XStack>
        </YStack>
      </Card.Footer>
    </Card>
  );
};

interface Props {
  weekView?: boolean;
  leftArrowIcon?: ImageSourcePropType;
  rightArrowIcon?: ImageSourcePropType;
  onDateChanged?: (date: string, updateSource: string) => void;
  onMonthChange?: (date: { dateString: string }) => void;
  calendarTheme?: object;
  todayButtonTheme?: object;
  initialDate?: string;
  scrollToNextEvent?: boolean;
  dayFormat?: string;
  calendarStyle?: object;
  headerStyle?: object;
}

export function AgendaCalendar({
  weekView = false,
  leftArrowIcon,
  rightArrowIcon,
  onDateChanged,
  onMonthChange,
  calendarTheme,
  todayButtonTheme,
  initialDate,
  scrollToNextEvent,
  dayFormat,
  calendarStyle,
  headerStyle,
}: Props) {
  const [events, setEvents] = useState<Models.Document[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean }>>({});
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toISOString());
  const cachedEvents = useRef<{ [date: string]: Models.Document[] }>({});
  const theme = useTheme();
  const backgroundColor = theme?.background?.val;
  const primaryColor = theme?.color?.val

const { push } = useRouter();
  const { campus } = useCampus();

  async function fetchEvents(date: string) {

    let query = [
      Query.select(['title', 'image', '$createdAt', '$id']),
      Query.limit(25),
    ];

    if (campus?.$id) {
      query.push(Query.equal('campus_id', campus.$id));
    }
    try {
      const fetchedEvents = await databases.listDocuments('app', 'event', query);
      console.log('Fetched events:', fetchedEvents);
      cachedEvents.current[date] = fetchedEvents.documents;
      setEvents(fetchedEvents.documents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  }

  useEffect(() => {
    const initialFormattedDate = getFormattedDateFromString(selectedDate);
    if (!cachedEvents.current[initialFormattedDate]) {
      fetchEvents(initialFormattedDate);
    } else {
      setEvents(cachedEvents.current[initialFormattedDate]);
    }
  }, [selectedDate]);

  const renderItem = useCallback(({ item }: { item: Models.Document }) => {
    return <AgendaItem item={item} />;
  }, []);

  const handleDateChanged = (date: string) => {
    const formattedDate = getFormattedDateFromString(date);
    setSelectedDate(formattedDate);
    if (onDateChanged) {
      onDateChanged(date, 'user'); // Assuming 'user' as the update source
    }
  };

  // Define the type for the grouped events
  interface GroupedEvents {
    [date: string]: Models.Document[];
  }

  // Group events by date
  const groupedEvents: GroupedEvents = events.reduce((acc: GroupedEvents, event: Models.Document) => {
    const date = getFormattedDateFromString(event.$createdAt);
    if (date !== 'Invalid date') {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
    } else {
      console.error('Invalid date for event:', event);
    }
    return acc;
  }, {});

  const sections = Object.keys(groupedEvents).map(date => ({
    title: date,
    data: groupedEvents[date]
  }));

  return (
    <CalendarProvider
      date={selectedDate}
      onDateChanged={handleDateChanged}
      onMonthChange={onMonthChange}
      showTodayButton
      theme={{
        selectedDayTextColor: "green",
        backgroundColor: backgroundColor,
      }}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {weekView ? (
        <WeekCalendar firstDay={1} markedDates={markedDates} />
      ) : (
        <ExpandableCalendar
          firstDay={1}
          markedDates={markedDates}
          
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}

          theme={{
            backgroundColor: backgroundColor,
            calendarBackground: backgroundColor,
          }}
          style={{
            backgroundColor: backgroundColor,
            
          }}
          calendarStyle={{
            backgroundColor: backgroundColor,
            
          }}
          headerStyle={{
            backgroundColor: backgroundColor
          }}
          renderArrow={(direction) => direction === 'right' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        />
      )}
      {events.length > 0 ? (
        <AgendaList
          sections={sections}
          renderItem={renderItem}
          scrollToNextEvent={scrollToNextEvent}
          sectionStyle={{ backgroundColor: backgroundColor }}
          dayFormat={dayFormat}
          ItemSeparatorComponent={Separator}
          refreshing={false}
          onRefresh={() => fetchEvents(new Date().toISOString())}
        />
      ) : (
        <YStack gap="$4" alignItems="center" justifyContent="center">
          <H5>No events found</H5>
        </YStack>
      )}
    </CalendarProvider>
  );
}
