/**
 * LoadingSpinner - Loading state component for admin interface
 *
 * Displays an animated spinner with optional loading text.
 */

import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';

/**
 * Props interface
 */
interface LoadingSpinnerProps {
  /** Loading message to display */
  message?: string;
  /** Size of spinner */
  size?: 'small' | 'medium' | 'large';
  /** Center the spinner in container */
  centered?: boolean;
}

/**
 * Container for centered layout
 */
const Container = styled.div<{ $centered: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${(props) => (props.$centered ? 'center' : 'flex-start')};
  gap: 1rem;
  padding: ${(props) => (props.$centered ? '3rem' : '1rem 0')};
  min-height: ${(props) => (props.$centered ? '200px' : 'auto')};
`;

/**
 * Spinner element
 */
const Spinner = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  width: ${(props) => {
    switch (props.$size) {
      case 'small':
        return '24px';
      case 'large':
        return '56px';
      default:
        return '40px';
    }
  }};
  height: ${(props) => {
    switch (props.$size) {
      case 'small':
        return '24px';
      case 'large':
        return '56px';
      default:
        return '40px';
    }
  }};
  border: ${(props) => {
      switch (props.$size) {
        case 'small':
          return '3px';
        case 'large':
          return '5px';
        default:
          return '4px';
      }
    }}
    solid ${colors.bodyBg};
  border-top-color: ${colors.mint};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Loading message text
 */
const LoadingText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  color: ${colors.grayishBlue};
  margin: 0;
  text-align: center;
`;

/**
 * LoadingSpinner Component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  centered = true
}) => {
  return (
    <Container $centered={centered}>
      <Spinner $size={size} />
      {message && <LoadingText>{message}</LoadingText>}
    </Container>
  );
};

export default LoadingSpinner;
