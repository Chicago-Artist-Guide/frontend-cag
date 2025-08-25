import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

export const PageFooterRow = styled.div`
  padding: 32px 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  bottom: 0;
  z-index: 10;

  @media (min-width: 640px) {
    padding: 40px 24px;
  }

  @media (min-width: 768px) {
    padding: 48px 32px;
    position: static;
    border-top: none;
    background: transparent;
  }
`;

export const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
  }
`;

export const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  order: 2;

  @media (min-width: 768px) {
    order: 1;
    flex: 1;
    max-width: 200px;
  }
`;

export const ButtonCol = styled.div`
  flex: 1;
  display: flex;

  &.back-button {
    justify-content: flex-start;
  }

  &.continue-button {
    justify-content: flex-end;
  }

  @media (min-width: 768px) {
    &.back-button {
      justify-content: flex-start;
    }

    &.continue-button {
      justify-content: flex-end;
    }
  }
`;

export const PaginationSection = styled.div`
  display: flex;
  justify-content: center;
  order: 1;

  @media (min-width: 768px) {
    order: 2;
    flex: 1;
  }
`;

export const Pagination = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  gap: 8px;

  @media (min-width: 640px) {
    gap: 12px;
  }

  @media (min-width: 768px) {
    gap: 16px;
  }

  li {
    list-style-type: none;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    span {
      background-color: ${colors.paginationGray};
      border-radius: 50%;
      height: 28px;
      width: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${fonts.montserrat};
      font-size: 11px;
      font-weight: 600;
      color: #666;
      transition: all 0.2s ease;

      @media (min-width: 640px) {
        height: 32px;
        width: 32px;
        font-size: 12px;
      }

      @media (min-width: 768px) {
        height: 36px;
        width: 36px;
        font-size: 13px;
      }
    }

    &:after {
      content: '';
      width: 16px;
      height: 2px;
      background-color: ${colors.italicColor};
      margin-left: 8px;

      @media (min-width: 640px) {
        width: 20px;
        margin-left: 12px;
      }

      @media (min-width: 768px) {
        width: 28px;
        height: 1px;
        margin-left: 16px;
      }
    }

    &:last-child:after {
      display: none;
    }

    &.complete span {
      background: ${colors.banana};
      color: #2f4550;
      transform: scale(1.1);
    }

    &.active span {
      background-color: ${colors.butter};
      color: #2f4550;
      transform: scale(1.15);
      box-shadow: 0 2px 8px rgba(130, 178, 154, 0.3);
    }
  }
`;
