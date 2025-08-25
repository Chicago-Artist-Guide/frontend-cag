import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, fonts, breakpoints } from '../../theme/styleVars';

// Calendar icon that matches the screenshots
const CalendarIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="#2F4550"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 9h18" />
  </svg>
);

// Location icon that matches the screenshots
const LocationIcon = () => (
  <svg
    width="24"
    height="24"
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

const getDateStringForEvent = (event: EventType) => {
  const dateObj = new Date(event.date + 'T00:00:00'); //server is in UTC
  if (isNaN(dateObj.getTime())) {
    console.error(`Invalid date for event ${event.id}: ${event.date}`);
    return null;
  }

  const options = {
    weekday: 'long' as const,
    month: 'long' as const,
    day: 'numeric' as const
  };
  // dateObj is correct here, loses a day when the 'timezone' adjustment is applied. so remove it.

  return dateObj.toLocaleDateString('en-US', options);
};

export const EventCard: React.FC<{
  event: EventType;
  status: 'upcoming' | 'past';
  index?: number;
}> = ({ event, status, index = 0 }) => {
  const dateString = getDateStringForEvent(event);
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <CardLink
      href={event.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      ref={cardRef}
      className={status}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContainer className={status}>
        <MobileView className={status}>
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
          <Content>
            <EventTitle>{event.name}</EventTitle>
            <EventDescription>{event.details}</EventDescription>
            <EventPrice>Price: {event.price}</EventPrice>
            <MoreInfoButton>More Info</MoreInfoButton>
          </Content>
          {event.image && <EventImage src={event.image} alt={event.name} />}
        </MobileView>

        <TabletView className={status}>
          <CardHeader className={status}>
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
          </CardHeader>

          <CardContent>
            <CardLeftSide>
              <EventTitle>{event.name}</EventTitle>
              <EventDescription>{event.details}</EventDescription>
              <EventPrice>Price: {event.price}</EventPrice>
              <MoreInfoButton>More Info</MoreInfoButton>
            </CardLeftSide>

            {event.image && (
              <CardRightSide>
                <EventImageTablet src={event.image} alt={event.name} />
              </CardRightSide>
            )}
          </CardContent>
        </TabletView>

        <DesktopView>
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
            {event.image && <EventImage src={event.image} alt={event.name} />}
          </RightCol>
        </DesktopView>
      </CardContainer>
    </CardLink>
  );
};

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CardLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease-in-out;

  &.visible {
    animation: ${fadeInUp} 0.5s ease-out forwards;
  }

  &:hover {
    text-decoration: none;
  }
`;

const CardContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    box-shadow 0.3s ease-in-out,
    transform 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }

  &.past {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

const MobileView = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fffbe7;
  gap: 16px;

  &.past {
    background: #cad2e6;
  }

  @media (min-width: ${breakpoints.sm}) {
    display: none;
  }
`;

const TabletView = styled.div`
  display: none;

  @media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg}) {
    display: flex;
    flex-direction: column;
  }
`;

const CardHeader = styled.div`
  background: #fffbe7;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &.past {
    background: #cad2e6;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: row;
  background: white;
`;

const CardLeftSide = styled.div`
  flex: 2;
  padding: 24px;
`;

const CardRightSide = styled.div`
  flex: 1;
  max-width: 35%;
`;

const EventImageTablet = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DesktopView = styled.div`
  display: none;

  @media (min-width: ${breakpoints.lg}) {
    display: flex;
    flex-direction: row;
  }
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
  margin-bottom: 0;
`;

const DateText = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 1rem;
  color: #2f4550;
  line-height: 1.3;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1rem;
  }
`;

const TimeText = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 0.9rem;
  color: #2f4550;
  margin-top: 4px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
  }
`;

const LocationText = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 0.9rem;
  color: #2f4550;
  word-break: break-word;
  line-height: 1.4;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
    font-weight: 700;
  }
`;

const RightCol = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: stretch;
  background: #fff;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
  padding: 0;

  @media (min-width: ${breakpoints.md}) {
    flex: 2;
    padding: 32px 24px;
    justify-content: center;
  }
`;

const EventTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #2f4550;
  line-height: 1.3;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }
`;

const EventDescription = styled.p`
  font-family: ${fonts.lora};
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1rem;
    max-width: 90%;
  }
`;

const EventPrice = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2f4550;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1rem;
    margin-bottom: 18px;
  }
`;

const MoreInfoButton = styled.div`
  display: inline-block;
  background: #82b29a;
  color: #fff;
  font-family: ${fonts.montserrat};
  font-weight: 700;
  border-radius: 24px;
  padding: 12px 28px;
  font-size: 0.95rem;
  text-align: center;
  width: fit-content;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s ease-in-out;

  @media (min-width: ${breakpoints.md}) {
    padding: 10px 28px;
    font-size: 1.1rem;
    margin-top: 8px;
  }

  &:hover {
    background: #6fa086;
    transform: scale(1.05);
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #eee;
  margin-top: 0;
  border-radius: 8px;

  @media (min-width: ${breakpoints.lg}) {
    flex: 1;
    min-width: 180px;
    max-width: 220px;
    height: auto;
    border-radius: 0;
    margin-top: 0;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

export default EventCard;
