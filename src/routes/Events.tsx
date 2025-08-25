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
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((event) => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
