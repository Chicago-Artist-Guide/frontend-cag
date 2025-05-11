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
      <Title>EVENTS</Title>
      <Tagline>Celebrate, Learn & Grow with Chicago Artist Guide</Tagline>
      <DividerBar />

      <SectionTitle>Upcoming Events</SectionTitle>
      {loading ? (
        <p>Loading events...</p>
      ) : upcomingEvents.length === 0 ? (
        <p>No upcoming events at this time.</p>
      ) : (
        <EventList>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} status="upcoming" />
          ))}
        </EventList>
      )}

      <SectionTitle>Past Events</SectionTitle>
      {loading ? (
        <p>Loading events...</p>
      ) : pastEvents.length === 0 ? (
        <p>No past events found.</p>
      ) : (
        <EventList>
          {pastEvents.map((event) => (
            <EventCard key={event.id} event={event} status="past" />
          ))}
        </EventList>
      )}

      <EndOfEvents>— end of events —</EndOfEvents>
    </PageContainer>
  );
};

export default Events;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
`;

const DividerBar = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  margin: 18px 0 32px 0;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 48px;
`;

const EndOfEvents = styled.div`
  text-align: center;
  font-style: italic;
  color: #888;
  margin: 48px 0 0 0;
`;
