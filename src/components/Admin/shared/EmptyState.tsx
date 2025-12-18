/**
 * EmptyState - Empty state component for admin interface
 *
 * Displays when there are no results or content to show.
 */

import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faInbox } from '@fortawesome/free-solid-svg-icons';

/**
 * Props interface
 */
interface EmptyStateProps {
  /** Icon to display */
  icon?: IconProp;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: React.ReactNode;
}

/**
 * Container for empty state
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
`;

/**
 * Icon container
 */
const IconContainer = styled.div`
  font-size: 3rem;
  color: ${colors.grayishBlue};
  opacity: 0.5;
  margin-bottom: 1.5rem;
`;

/**
 * Title text
 */
const Title = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.slate};
  margin: 0 0 0.5rem 0;
`;

/**
 * Description text
 */
const Description = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  color: ${colors.grayishBlue};
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  line-height: 1.6;
`;

/**
 * Action button container
 */
const ActionContainer = styled.div`
  margin-top: 0.5rem;
`;

/**
 * EmptyState Component
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon = faInbox,
  title,
  description,
  action
}) => {
  return (
    <Container>
      <IconContainer>
        <FontAwesomeIcon icon={icon} />
      </IconContainer>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {action && <ActionContainer>{action}</ActionContainer>}
    </Container>
  );
};

export default EmptyState;
