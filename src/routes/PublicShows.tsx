import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { Col, Row } from 'react-bootstrap';
import { PageContainer } from '../components/layout';
import { Title, Tagline } from '../components/layout/Titles';
import { useFirebaseContext } from '../context/FirebaseContext';
import { Production } from '../components/Profile/Company/types';
import PublicShowCard from '../components/PublicShows/PublicShowCard';
import { Pagination } from '../components/shared';

const PublicShows = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [shows, setShows] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [firstPageLoaded, setFirstPageLoaded] = useState(false);
  const [totalShows, setTotalShows] = useState(0);

  // Number of shows per page
  const SHOWS_PER_PAGE = 20;

  // Fetch the total count of shows (for pagination)
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const activeProductionStatuses = [
          'Casting',
          'Hiring',
          'Pre-Production'
        ];
        const countQuery = query(
          collection(firebaseFirestore, 'productions'),
          where('status', 'in', activeProductionStatuses)
        );

        const snapshot = await getDocs(countQuery);
        const total = snapshot.size;
        setTotalShows(total);
        setTotalPages(Math.ceil(total / SHOWS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching total count:', error);
      }
    };

    fetchTotalCount();
  }, [firebaseFirestore]);

  // Fetch shows for the current page
  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);

        // Get active productions
        const activeProductionStatuses = [
          'Casting',
          'Hiring',
          'Pre-Production'
        ];

        let productionsRef;

        if (currentPage === 1 || !firstPageLoaded) {
          // First page query
          productionsRef = query(
            collection(firebaseFirestore, 'productions'),
            where('status', 'in', activeProductionStatuses),
            orderBy('production_name'),
            limit(SHOWS_PER_PAGE)
          );
          setFirstPageLoaded(true);
        } else if (lastVisible) {
          // Subsequent pages
          productionsRef = query(
            collection(firebaseFirestore, 'productions'),
            where('status', 'in', activeProductionStatuses),
            orderBy('production_name'),
            startAfter(lastVisible),
            limit(SHOWS_PER_PAGE)
          );
        } else {
          // Fallback if lastVisible is not set
          productionsRef = query(
            collection(firebaseFirestore, 'productions'),
            where('status', 'in', activeProductionStatuses),
            orderBy('production_name'),
            limit(SHOWS_PER_PAGE)
          );
        }

        const productionsSnapshot = await getDocs(productionsRef);

        // Set the last document for pagination
        const lastDoc =
          productionsSnapshot.docs[productionsSnapshot.docs.length - 1];
        setLastVisible(lastDoc);

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
  }, [firebaseFirestore, currentPage]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Reset lastVisible if going back to first page
    if (pageNumber === 1) {
      setLastVisible(null);
      setFirstPageLoaded(false);
    }
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

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
            <>
              <div className="mt-4">
                {shows.map((show) => (
                  <PublicShowCard key={show.production_id} show={show} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalShows}
                itemsPerPage={SHOWS_PER_PAGE}
                onPageChange={handlePageChange}
                showItemCount={true}
              />
            </>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PublicShows;
