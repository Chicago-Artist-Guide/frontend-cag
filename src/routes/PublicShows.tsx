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
import { usePagination } from '../context/PaginationContext';
import { Production } from '../components/Profile/Company/types';
import PublicShowCard from '../components/PublicShows/PublicShowCard';
import PublicShowCardSkeleton from '../components/PublicShows/PublicShowCardSkeleton';
import { Pagination } from '../components/shared';

const PublicShows = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { getPaginationState, savePaginationState } = usePagination();
  const [shows, setShows] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the saved page from context, or default to page 1
  const savedState = getPaginationState('/shows');
  const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);

  const [totalPages, setTotalPages] = useState(1);
  // Store the last document for each page to enable backward navigation
  const [pageDocuments, setPageDocuments] = useState<{
    [key: number]: DocumentSnapshot;
  }>({});
  const [totalShows, setTotalShows] = useState(0);

  // Number of shows per page
  const SHOWS_PER_PAGE = 20;

  // Effect to restore scroll position when returning from show detail
  useEffect(() => {
    const savedState = getPaginationState('/shows');
    if (savedState.scrollPosition) {
      // Use a small timeout to ensure the DOM has updated
      setTimeout(() => {
        window.scrollTo(0, savedState.scrollPosition || 0);
      }, 100);
    }
  }, []);

  // Combined fetch function for both total count and current page shows
  useEffect(() => {
    // Flag to track if the component is mounted
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);

        // Get active productions
        const activeProductionStatuses = [
          'Casting',
          'Hiring',
          'Pre-Production'
        ];

        // First, get the total count for pagination
        const countQuery = query(
          collection(firebaseFirestore, 'productions'),
          where('status', 'in', activeProductionStatuses)
        );

        const countSnapshot = await getDocs(countQuery);

        if (!isMounted) return;

        // Filter out invalid productions from the count
        const validProductions = countSnapshot.docs.filter((doc) => {
          const data = doc.data();
          return (
            data.production_name &&
            data.account_id &&
            typeof data.production_name === 'string' &&
            typeof data.account_id === 'string'
          );
        });

        const total = validProductions.length;
        setTotalShows(total);
        setTotalPages(Math.ceil(total / SHOWS_PER_PAGE));

        // Then, get the paginated results
        let productionsRef;

        if (currentPage === 1) {
          // First page query
          productionsRef = query(
            collection(firebaseFirestore, 'productions'),
            where('status', 'in', activeProductionStatuses),
            orderBy('production_name'),
            limit(SHOWS_PER_PAGE)
          );
        } else {
          // Check if we have a document for the previous page
          const prevPageDoc = pageDocuments[currentPage - 1];

          if (prevPageDoc) {
            // Use the last document from the previous page as a cursor
            productionsRef = query(
              collection(firebaseFirestore, 'productions'),
              where('status', 'in', activeProductionStatuses),
              orderBy('production_name'),
              startAfter(prevPageDoc),
              limit(SHOWS_PER_PAGE)
            );
          } else {
            // Fallback to first page if we don't have the previous page document
            console.warn(
              `No document found for page ${currentPage - 1}, falling back to first page`
            );
            productionsRef = query(
              collection(firebaseFirestore, 'productions'),
              where('status', 'in', activeProductionStatuses),
              orderBy('production_name'),
              limit(SHOWS_PER_PAGE)
            );
          }
        }

        const productionsSnapshot = await getDocs(productionsRef);

        if (!isMounted) return;

        // Store the last document for the current page
        if (productionsSnapshot.docs.length > 0) {
          const lastDoc =
            productionsSnapshot.docs[productionsSnapshot.docs.length - 1];
          setPageDocuments((prev) => ({
            ...prev,
            [currentPage]: lastDoc
          }));
        }

        // Map and filter out invalid productions
        const productions = productionsSnapshot.docs
          .map((doc) => {
            const data = doc.data() as Production;
            // Ensure production_id is set to the document ID if not already present
            return {
              ...data,
              production_id: data.production_id || doc.id
            };
          })
          .filter((production) => {
            // Filter out productions without required fields
            return (
              production.production_name &&
              production.account_id &&
              typeof production.production_name === 'string' &&
              typeof production.account_id === 'string'
            );
          });

        if (!isMounted) return;

        setShows(productions);
        setLoading(false);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching shows:', error);
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [firebaseFirestore, currentPage, SHOWS_PER_PAGE]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    // Update current page (this will trigger the useEffect)
    setCurrentPage(pageNumber);

    // Save the current page to the pagination context
    savePaginationState('/shows', pageNumber, window.scrollY);

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
            <div className="mt-4">
              <PublicShowCardSkeleton />
              <PublicShowCardSkeleton />
              <PublicShowCardSkeleton />
            </div>
          ) : shows.length === 0 ? (
            <p>No active shows found at this time. Please check back later.</p>
          ) : (
            <>
              <div className="mt-4">
                {shows.map((show, index) => (
                  <PublicShowCard
                    key={`${show.production_id || 'unknown'}-${index}`}
                    show={show}
                  />
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
