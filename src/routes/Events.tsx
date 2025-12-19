import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { PageContainer } from '../components/layout';
import { Title, Tagline } from '../components/layout/Titles';
import { useFirebaseContext } from '../context/FirebaseContext';
import { EventCard } from '../components/shared';
import styled from 'styled-components';

type EventType = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  details: string;
  price: string;
  image: string;
  externalUrl: string;
  status?: 'published' | 'draft' | 'cancelled';
};

/**
 * Combines event date and time into a complete Date object for accurate comparison.
 * Handles various time formats (e.g., "7:00 PM", "19:00", "7 PM").
 * Defaults to end-of-day (23:59:59) if time is missing or invalid.
 */
const getEventDateTime = (event: EventType): Date => {
  try {
    // Start with the date
    const eventDate = new Date(event.date);

    if (isNaN(eventDate.getTime())) {
      // Invalid date - return a past date as safe default
      console.error(
        'Invalid event date:',
        event.date,
        'for event:',
        event.name
      );
      return new Date(0);
    }

    // If no time provided, default to start of day (00:00:00)
    // This ensures events move to "past" section after the event date has fully passed
    if (!event.time || event.time.trim() === '') {
      eventDate.setHours(0, 0, 0, 0);
      return eventDate;
    }

    // Parse the time string
    const timeStr = event.time.trim().toUpperCase();
    let hours = 0;
    let minutes = 0;

    // Try to match various time formats
    // Format: "7:00 PM", "7:00PM", "7 PM", "7PM"
    const time12Match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
    // Format: "19:00", "7:00"
    const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);

    if (time12Match) {
      hours = parseInt(time12Match[1], 10);
      minutes = time12Match[2] ? parseInt(time12Match[2], 10) : 0;
      const isPM = time12Match[3] === 'PM';

      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
    } else if (time24Match) {
      hours = parseInt(time24Match[1], 10);
      minutes = parseInt(time24Match[2], 10);
    } else {
      // Couldn't parse time - default to start of day
      eventDate.setHours(0, 0, 0, 0);
      return eventDate;
    }

    eventDate.setHours(hours, minutes, 0, 0);
    return eventDate;
  } catch (error) {
    console.error(
      'Error parsing event datetime:',
      error,
      'for event:',
      event.name
    );
    return new Date(0); // Return past date as safe default
  }
};

const Events: React.FC = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const eventsRef = collection(firebaseFirestore, 'events');
      const q = query(eventsRef);
      const snapshot = await getDocs(q);
      const eventsList: EventType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as EventType[];
      setEvents(eventsList);
      setLoading(false);
    };
    fetchEvents();
  }, [firebaseFirestore]);

  const now = new Date();

  // Only show published events (or events without status for backwards compatibility)
  const publishedEvents = events.filter(
    (event) => !event.status || event.status === 'published'
  );

  const upcomingEvents = publishedEvents
    .filter((event) => getEventDateTime(event) >= now)
    .sort(
      (a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime()
    );

  const pastEvents = publishedEvents
    .filter((event) => getEventDateTime(event) < now)
    .sort(
      (a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime()
    );

  return (
    <PageContainer>
      <HeaderSection>
        <Title>EVENTS</Title>
        <Tagline>Celebrate, Learn & Grow with Chicago Artist Guide</Tagline>
        <DividerBar />
      </HeaderSection>

      <EventsSection>
        <SectionTitle>Upcoming Events</SectionTitle>
        {loading ? (
          <LoadingText>Loading events...</LoadingText>
        ) : upcomingEvents.length === 0 ? (
          <EmptyStateText>No upcoming events at this time.</EmptyStateText>
        ) : (
          <EventList>
            {upcomingEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                status="upcoming"
                index={index}
              />
            ))}
          </EventList>
        )}

        <SectionTitle>Past Events</SectionTitle>
        {loading ? (
          <LoadingText>Loading events...</LoadingText>
        ) : pastEvents.length === 0 ? (
          <EmptyStateText>No past events found.</EmptyStateText>
        ) : (
          <EventList>
            {pastEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                status="past"
                index={index}
              />
            ))}
          </EventList>
        )}

        <EndOfEvents>— end of events —</EndOfEvents>
      </EventsSection>
    </PageContainer>
  );
};

export default Events;

const HeaderSection = styled.div`
  margin-bottom: 24px;
  text-align: center;

  @media (min-width: 640px) {
    margin-bottom: 32px;
  }

  @media (min-width: 768px) {
    margin-bottom: 48px;
  }
`;

const EventsSection = styled.div`
  padding: 0 16px;

  @media (min-width: 640px) {
    padding: 0 24px;
  }

  @media (min-width: 768px) {
    padding: 0 32px;
  }

  @media (min-width: 1024px) {
    padding: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: #2f4550;
  text-align: center;

  @media (min-width: 640px) {
    font-size: 1.375rem;
    margin-top: 2.5rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  @media (min-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const DividerBar = styled.div`
  width: 100%;
  max-width: 200px;
  height: 3px;
  border-radius: 2px;
  margin: 16px auto 24px auto;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);

  @media (min-width: 640px) {
    max-width: 250px;
    height: 4px;
    margin: 18px auto 28px auto;
  }

  @media (min-width: 768px) {
    max-width: 300px;
    margin: 18px auto 32px auto;
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;

  @media (min-width: 640px) {
    gap: 24px;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    gap: 32px;
    margin-bottom: 48px;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #888;
  margin: 20px 0;
  font-size: 0.9rem;

  @media (min-width: 640px) {
    font-size: 1rem;
    margin: 24px 0;
  }
`;

const EmptyStateText = styled.p`
  text-align: center;
  color: #888;
  margin: 20px 0;
  font-size: 0.9rem;
  font-style: italic;

  @media (min-width: 640px) {
    font-size: 1rem;
    margin: 24px 0;
  }
`;

const EndOfEvents = styled.div`
  text-align: center;
  font-style: italic;
  color: #888;
  margin: 32px 0 0 0;
  font-size: 0.9rem;

  @media (min-width: 640px) {
    font-size: 1rem;
    margin: 40px 0 0 0;
  }

  @media (min-width: 768px) {
    margin: 48px 0 0 0;
  }
`;
