import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemCount?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemCount = true
}) => {
  // Only show pagination if there are more items than can fit on one page
  if (totalItems <= itemsPerPage) {
    return null;
  }

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    onPageChange(pageNumber);
  };

  // Calculate the range of items being displayed
  const firstItem = (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Determine which page numbers to show
  const getVisiblePageNumbers = () => {
    const delta = 1; // Number of pages to show on each side of current page
    const pages = [];

    // Always include first page
    if (currentPage > delta + 1) {
      pages.push(1);
      if (currentPage > delta + 2) {
        pages.push('ellipsis');
      }
    }

    // Add pages around current page
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Always include last page
    if (currentPage < totalPages - delta) {
      if (currentPage < totalPages - delta - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePageNumbers();

  return (
    <PaginationContainer>
      <PaginationWrapper>
        <PaginationButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;Previous
        </PaginationButton>

        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <EllipsisItem key={`ellipsis-${index}`}>...</EllipsisItem>
          ) : (
            <PageNumberButton
              key={`page-${page}`}
              onClick={() => handlePageChange(page as number)}
              active={page === currentPage}
            >
              {page}
            </PageNumberButton>
          )
        )}

        <PaginationButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;Next
        </PaginationButton>
      </PaginationWrapper>

      {showItemCount && (
        <ItemCount>
          Showing {firstItem}-{lastItem} of {totalItems} items
        </ItemCount>
      )}
    </PaginationContainer>
  );
};

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${colors.lightGrey};
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  background-color: white;
  border: none;
  border-right: 1px solid ${colors.lightGrey};
  padding: 12px 18px;
  font-family: ${fonts.montserrat};
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.disabled ? colors.lightGrey : colors.grayishBlue)};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  &:last-child {
    border-right: none;
  }

  &:hover:not(:disabled) {
    background-color: ${colors.lightestGrey};
    color: ${colors.mint};
  }

  &:focus {
    outline: none;
  }
`;

// TODO: understand why we need to use as any to resolve the TS error for circular propTypes
const PageNumberButton = styled(PaginationButton as any)<{ active: boolean }>`
  background-color: ${(props) => (props.active ? colors.mint : 'white')};
  color: ${(props) => (props.active ? 'white' : colors.grayishBlue)};
  min-width: 50px;
  text-align: center;
  font-weight: ${(props) => (props.active ? '600' : '500')};
  padding: ${(props) => (props.active ? '12px 18px' : '12px 18px')};

  &:hover {
    background-color: ${(props) =>
      props.active ? colors.mint : colors.lightestGrey};
    color: ${(props) => (props.active ? 'white' : colors.mint)};
  }
`;

const EllipsisItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 15px;
  border-right: 1px solid ${colors.lightGrey};
  background-color: white;
  color: ${colors.grayishBlue};
  font-family: ${fonts.montserrat};
  min-width: 50px;
  text-align: center;
`;

const ItemCount = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 15px;
  color: ${colors.grayishBlue};
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
`;

export default Pagination;
