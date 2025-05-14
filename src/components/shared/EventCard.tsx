import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

// TODO: Update these icons, because they're not working
const CalendarIcon = () => (
  <svg
    width="28"
    height="28"
    fill="none"
    stroke="#2F4550"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 9h18" />
  </svg>
);

const LocationIcon = () => (
  <svg
    width="28"
    height="28"
    fill="none"
    stroke="#2F4550"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M12 21s-6-5.686-6-10A6 6 0 0118 11c0 4.314-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);

type EventType = {
  id: string;
  name: string;
  date: string; // ISO string
  time: string;
  location: string;
  details: string;
  price: string;
  image: string;
  externalUrl: string;
};

export const EventCard: React.FC<{
  event: EventType;
  status: 'upcoming' | 'past';
}> = ({ event, status }) => {
  const dateObj = new Date(event.date);
  const dateString = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'CST'
  });

  return (
    <CardLink
      href={event.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <CardContainer>
        <LeftCol className={status}>
          <IconRow>
            <CalendarIcon />
            <div>
              <DateText>{dateString}</DateText>
              <TimeText>{event.time}</TimeText>
            </div>
          </IconRow>
          <IconRow>
            <LocationIcon />
            <LocationText>{event.location}</LocationText>
          </IconRow>
        </LeftCol>
        <RightCol>
          <Content>
            <EventTitle>{event.name}</EventTitle>
            <EventDescription>{event.details}</EventDescription>
            <EventPrice>Price: {event.price}</EventPrice>
            <MoreInfoButton>More Info</MoreInfoButton>
          </Content>
          <EventImage src={event.image} alt={event.name} />
        </RightCol>
      </CardContainer>
    </CardLink>
  );
};

const CardLink = styled.a`
  text-decoration: none;
  color: inherit;
  &:hover {
    box-shadow: 0 4px 24px #00000022;
    text-decoration: none;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #00000014;
  overflow: hidden;
  min-height: 200px;
  max-width: 100%;
`;

const LeftCol = styled.div`
  background: #fffbe7;
  min-width: 290px;
  max-width: 290px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  padding: 32px 24px;

  &.past {
    background: #cad2e6;
  }
`;

const IconRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
`;

const DateText = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 1.1rem;
  color: #2f4550;
`;

const TimeText = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 1rem;
  color: #2f4550;
  margin-top: 2px;
`;

const LocationText = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 1rem;
  color: #2f4550;
`;

const RightCol = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: stretch;
  background: #fff;
`;

const Content = styled.div`
  flex: 2;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

const EventTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2f4550;
`;

const EventDescription = styled.p`
  font-family: ${fonts.lora};
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 16px;
  max-width: 90%;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventPrice = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 18px;
`;

const MoreInfoButton = styled.div`
  display: inline-block;
  background: #82b29a;
  color: #fff;
  font-family: ${fonts.montserrat};
  font-weight: 700;
  border-radius: 20px;
  padding: 10px 28px;
  font-size: 1.1rem;
  text-align: center;
  width: fit-content;
  margin-top: 8px;
`;

const EventImage = styled.img`
  flex: 1;
  min-width: 180px;
  max-width: 220px;
  object-fit: cover;
  background: #eee;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  align-self: stretch;
`;

export default EventCard;
