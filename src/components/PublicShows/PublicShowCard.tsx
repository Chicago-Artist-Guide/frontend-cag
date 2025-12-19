import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../shared';
import { colors, fonts } from '../../theme/styleVars';
import { Production } from '../Profile/Company/types';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebaseContext } from '../../context/FirebaseContext';

interface PublicShowCardProps {
  show: Production;
}

const PublicShowCard: React.FC<PublicShowCardProps> = ({ show }) => {
  const { firebaseFirestore } = useFirebaseContext();
  const [theaterName, setTheaterName] = useState<string>('');

  useEffect(() => {
    // Flag to track if the component is mounted
    let isMounted = true;

    const fetchTheaterName = async () => {
      if (!show || !show.account_id) {
        if (isMounted) setTheaterName('Unknown Theater');
        return;
      }

      try {
        const accountRef = doc(firebaseFirestore, 'accounts', show.account_id);
        const accountDoc = await getDoc(accountRef);

        if (!isMounted) return;

        if (accountDoc.exists()) {
          const accountData = accountDoc.data();

          // Check if profile_id exists before trying to access it
          if (accountData && accountData.profile_id) {
            const profileRef = doc(
              firebaseFirestore,
              'profiles',
              accountData.profile_id
            );
            const profileDoc = await getDoc(profileRef);

            if (!isMounted) return;

            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              if (profileData && profileData.theatre_name) {
                setTheaterName(profileData.theatre_name);
              } else {
                setTheaterName('Unknown Theater');
              }
            } else {
              setTheaterName('Unknown Theater');
            }
          } else {
            setTheaterName('Unknown Theater');
          }
        } else {
          setTheaterName('Unknown Theater');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching theater name:', error);
          setTheaterName('Unknown Theater');
        }
      }
    };

    fetchTheaterName();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [show?.account_id, firebaseFirestore]);

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
              <TheaterNameLink to={`/profile/view/${show?.account_id}`}>
                {theaterName}
              </TheaterNameLink>
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
