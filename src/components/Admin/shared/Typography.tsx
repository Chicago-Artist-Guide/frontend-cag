/**
 * Typography - Reusable typography components for admin interface
 *
 * Provides consistent text styling matching the main app's design system.
 */

import styled from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';

/**
 * Page Title (h1)
 * Main page heading
 */
export const PageTitle = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 2rem;
  font-weight: 700;
  color: ${colors.slate};
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.01em;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

/**
 * Page Subtitle
 * Secondary text below page title
 */
export const PageSubtitle = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  color: ${colors.grayishBlue};
  margin: 0 0 2.5rem 0;
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

/**
 * Section Title (h2)
 * Section headings within pages
 */
export const SectionTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.slate};
  margin: 0 0 1rem 0;
  letter-spacing: 0.01em;
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

/**
 * Subsection Title (h3)
 * Smaller section headings
 */
export const SubsectionTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.slate};
  margin: 0 0 0.75rem 0;
  letter-spacing: 0.01em;
  line-height: 1.4;
`;

/**
 * Body Text
 * Standard paragraph text
 */
export const BodyText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  font-weight: 400;
  color: ${colors.mainFont};
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

/**
 * Label Text
 * Form labels and small headings
 */
export const Label = styled.label`
  font-family: ${fonts.mainFont};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.grayishBlue};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.5rem;
`;

/**
 * Small Text
 * Supporting text, captions
 */
export const SmallText = styled.span`
  font-family: ${fonts.mainFont};
  font-size: 0.875rem;
  font-weight: 400;
  color: ${colors.grayishBlue};
  line-height: 1.5;
`;

/**
 * Tiny Text
 * Very small text for metadata
 */
export const TinyText = styled.span`
  font-family: ${fonts.mainFont};
  font-size: 0.75rem;
  font-weight: 400;
  color: ${colors.grayishBlue};
  line-height: 1.4;
`;

/**
 * Strong Text
 * Emphasized text
 */
export const StrongText = styled.span`
  font-family: ${fonts.mainFont};
  font-size: inherit;
  font-weight: 600;
  color: ${colors.slate};
`;

/**
 * Muted Text
 * De-emphasized text
 */
export const MutedText = styled.span`
  font-family: ${fonts.mainFont};
  font-size: inherit;
  font-weight: 400;
  color: ${colors.grayishBlue};
  opacity: 0.8;
`;
