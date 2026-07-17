import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../shared';
import { colors, fonts } from '../../theme/styleVars';
import { Production } from '../Profile/Company/types';
import { getAccountByIdOrUid } from '../../services/accounts/client';
import { findProfileByAccountId } from '../../services/profiles/client';
import { useUserContext } from '../../context/UserContext';

interface PublicShowCardProps {
  show: Production;
}

const PublicShowCard: React.FC<
  React.PropsWithChildren<PublicShowCardProps>
> = ({ show }) => {
  const { currentUser } = useUserContext();
  const [theaterName, setTheaterName] = useState<string>(
    show.theater_name || ''
  );

  useEffect(() => {
    // If the production already has a denormalized theater_name, use it directly.
    if (show.theater_name) {
      setTheaterName(show.theater_name);
      return;
    }

    // For anonymous users, never call the auth-gated accounts query.
    if (!currentUser) {
      setTheaterName('');
      return;
    }

    // Authenticated users: best-effort fallback for un-backfilled legacy productions.
    if (!show.account_id) {
      setTheaterName('');
      return;
    }

    let isMounted = true;

    // production.account_id is the company's auth uid (see AddProduction.tsx),
    // not a Firestore doc id. Look up the account by uid, then prefer the
    // profile's theatre_name, falling back to the account's theater_name.
    const fetchTheaterName = async () => {
      try {
        const account = await getAccountByIdOrUid(show.account_id);

        if (!isMounted) return;

        if (!account) {
          setTheaterName('');
          return;
        }

        const profile = await findProfileByAccountId(account.id);

        if (!isMounted) return;

        const resolvedName =
          profile?.data.theatre_name || account.data.theater_name || '';
        setTheaterName(resolvedName);
      } catch {
        // Silently ignore — theater name is non-critical display data.
      }
    };

    fetchTheaterName();

    return () => {
      isMounted = false;
    };
  }, [show.theater_name, show.account_id, currentUser]);

  return (
    <ShowCard>
      <Row>
        <Col lg={4}>
          <ShowImage src={show?.production_image_url} fluid />
        </Col>
        <RightCol lg={{ span: 7, offset: 1 }}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <div className="flex-grow-1">
              <ShowName>{show?.production_name}</ShowName>
              {theaterName ? (
                <TheaterNameLink to={`/profile/view/${show?.account_id}`}>
                  {theaterName}
                </TheaterNameLink>
              ) : null}
              <ShowStatus>{show?.status}</ShowStatus>
              <ShowDescription>{show?.description}</ShowDescription>
            </div>
            <div
              className="d-flex flex-shrink-1 flex-row"
              style={{ gap: '1em' }}
            >
              {show.production_id ? (
                <Link to={`/shows/${show.production_id}`}>
                  <ShowButton
                    text="View Details"
                    type="button"
                    variant="primary"
                  />
                </Link>
              ) : (
                <ShowButton
                  text="View Details (ID Missing)"
                  type="button"
                  variant="primary"
                  disabled
                />
              )}
            </div>
          </div>
        </RightCol>
      </Row>
    </ShowCard>
  );
};

const ShowCard = styled.div`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
`;

const ShowImage = styled(Image)`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
`;

const RightCol = styled(Col)`
  padding: 20px 0;
`;

const ShowName = styled.h3`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 5px;
`;

const TheaterNameLink = styled(Link)`
  display: block;
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 18px;
  margin-bottom: 10px;
  color: ${colors.grayishBlue};
  text-decoration: none;

  &:hover {
    color: ${colors.mint};
    text-decoration: underline;
  }
`;

const ShowStatus = styled.p`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 16px;
  color: ${colors.mint};
  margin-bottom: 10px;
`;

const ShowDescription = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const ShowButton = styled(Button)`
  font-family: ${fonts.montserrat};
  font-weight: 600;
`;

export default PublicShowCard;
