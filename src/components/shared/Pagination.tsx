import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';
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

  return (
    <PaginationContainer>
      <BSPagination>
        <BSPagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {/* First page */}
        {currentPage > 2 && (
          <BSPagination.Item onClick={() => handlePageChange(1)}>
            1
          </BSPagination.Item>
        )}

        {/* Ellipsis if needed */}
        {currentPage > 3 && <BSPagination.Ellipsis disabled />}

        {/* Page before current */}
        {currentPage > 1 && (
          <BSPagination.Item onClick={() => handlePageChange(currentPage - 1)}>
            {currentPage - 1}
          </BSPagination.Item>
        )}

        {/* Current page */}
        <BSPagination.Item active>{currentPage}</BSPagination.Item>

        {/* Page after current */}
        {currentPage < totalPages && (
          <BSPagination.Item onClick={() => handlePageChange(currentPage + 1)}>
            {currentPage + 1}
          </BSPagination.Item>
        )}

        {/* Ellipsis if needed */}
        {currentPage < totalPages - 2 && <BSPagination.Ellipsis disabled />}

        {/* Last page */}
        {currentPage < totalPages - 1 && (
          <BSPagination.Item onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </BSPagination.Item>
        )}

        <BSPagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </BSPagination>

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

  .pagination {
    margin-bottom: 10px;

    .page-item {
      .page-link {
        color: ${colors.grayishBlue};
        border-color: ${colors.lightGrey};

        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(130, 178, 154, 0.25);
        }
      }

      &.active .page-link {
        background-color: ${colors.mint};
        border-color: ${colors.mint};
        color: white;
      }

      &:not(.disabled):hover .page-link {
        background-color: ${colors.lightestGrey};
        color: ${colors.mint};
      }
    }
  }
`;

const ItemCount = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 14px;
  color: ${colors.grayishBlue};
`;

export default Pagination;
