import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Col, Row } from 'react-bootstrap';
import { PageContainer } from '../components/layout';
import { Title, Tagline } from '../components/layout/Titles';
import { useFirebaseContext } from '../context/FirebaseContext';
import { Production } from '../components/Profile/Company/types';
import PublicShowCard from '../components/PublicShows/PublicShowCard';

const PublicShows = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [shows, setShows] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        // Get active productions
        const activeProductionStatuses = [
          'Casting',
          'Hiring',
          'Pre-Production'
        ];
        const productionsRef = query(
          collection(firebaseFirestore, 'productions'),
          where('status', 'in', activeProductionStatuses)
        );

        const productionsSnapshot = await getDocs(productionsRef);
        const productions = productionsSnapshot.docs.map(
          (doc) => doc.data() as Production
        );

        setShows(productions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shows:', error);
        setLoading(false);
      }
    };

    fetchShows();
  }, [firebaseFirestore]);

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>THEATRE SHOWS</Title>
          <Tagline>Discover opportunities in Chicago theatre</Tagline>

          {loading ? (
            <p>Loading shows...</p>
          ) : shows.length === 0 ? (
            <p>No active shows found at this time. Please check back later.</p>
          ) : (
            <div className="mt-4">
              {shows.map((show) => (
                <PublicShowCard key={show.production_id} show={show} />
              ))}
            </div>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PublicShows;
