'use client';

import styled, { keyframes } from 'styled-components';
import {
  breakpoints,
  colors,
  fonts
} from '../../../../src/theme/styleVars';

// Layout-only styling for /get-involved, lifted verbatim from the
// styled-component rules in src/routes/GetInvolved.tsx (everything except
// the contact form, which owns its own styling in contact-form.tsx). The
// role/board card copy stays in page.tsx as plain server-rendered markup —
// this frame only owns the CSS, matching the pattern used by
// app/(main)/(public)/donate/donate-page-frame.tsx.
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GetInvolvedPageFrame = styled.div`
  .header-section {
    margin-bottom: 20px;
    text-align: center;
    padding: 0 16px;
  }

  .section {
    padding: 32px 16px;
  }

  .section-title {
    font-family: ${fonts.montserrat};
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: uppercase;
    color: ${colors.secondaryFontColor};
    text-align: center;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .section-description {
    font-family: ${fonts.lora};
    font-size: 0.95rem;
    color: ${colors.italicColor};
    font-style: italic;
    text-align: center;
    margin-bottom: 24px;
    line-height: 1.5;
    padding: 0 8px;
  }

  .empty-state-text {
    text-align: center;
    color: #888;
    margin: 20px 0;
    font-size: 0.9rem;
    font-style: italic;
    padding: 0 16px;
    line-height: 1.5;
  }

  .role-list,
  .board-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .role-card,
  .board-card {
    background: ${colors.white};
    border-radius: 8px;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    opacity: 0;
    animation: ${fadeInUp} 0.5s ease-out forwards;
    width: 100%;
  }

  .role-metadata {
    background: #fffbe7;
    border-radius: 8px 8px 0 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .role-title,
  .board-title {
    font-family: ${fonts.montserrat};
    font-size: 1.125rem;
    font-weight: 700;
    color: ${colors.secondaryFontColor};
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .metadata-item {
    display: flex;
    gap: 4px;
    font-size: 0.875rem;
    line-height: 1.4;
    flex-wrap: wrap;
  }

  .metadata-label {
    font-family: ${fonts.montserrat};
    font-weight: 600;
    color: ${colors.secondaryFontColor};
  }

  .metadata-value {
    font-family: ${fonts.mainFont};
    color: #666;
  }

  .production-name {
    font-family: ${fonts.lora};
    font-size: 0.9rem;
    font-style: italic;
    color: ${colors.italicColor};
    margin-top: 8px;
    line-height: 1.4;
  }

  .role-location {
    font-family: ${fonts.mainFont};
    font-size: 0.8125rem;
    color: #888;
    margin-top: 4px;
    line-height: 1.4;
  }

  .role-content,
  .board-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
    border-radius: 0 0 8px 8px;
  }

  .role-description-label,
  .board-description-label {
    font-family: ${fonts.montserrat};
    font-size: 0.9375rem;
    font-weight: 700;
    color: ${colors.secondaryFontColor};
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .role-description,
  .board-description {
    font-family: ${fonts.mainFont};
    font-size: 0.9rem;
    color: #444;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .more-info-button {
    display: inline-flex;
    background: ${colors.primary};
    color: ${colors.white};
    font-family: ${fonts.montserrat};
    font-weight: 600;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 20px;
    padding: 10px 20px;
    text-decoration: none;
    align-self: flex-start;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
    cursor: pointer;

    &:hover {
      background: ${colors.darkPrimary};
      transform: scale(1.05);
      text-decoration: none;
      color: ${colors.white};
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .board-metadata {
    background: #c9d2e6;
    border-radius: 8px 8px 0 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .board-commitment {
    font-family: ${fonts.mainFont};
    font-size: 0.8125rem;
    color: #666;
    line-height: 1.4;
  }

  .end-of-page {
    text-align: center;
    font-style: italic;
    color: #888;
    margin: 24px 0;
    font-size: 0.875rem;
    padding: 0 16px;
    line-height: 1.5;
  }

  @media (min-width: ${breakpoints.sm}) {
    .header-section {
      margin-bottom: 28px;
      padding: 0 24px;
    }

    .section {
      padding: 40px 24px;
    }

    .section-title {
      font-size: 1.5rem;
      margin-bottom: 12px;
    }

    .section-description {
      font-size: 1rem;
      margin-bottom: 32px;
      padding: 0;
    }

    .empty-state-text {
      font-size: 1rem;
      margin: 24px 0;
      padding: 0;
    }

    .role-list,
    .board-list {
      gap: 24px;
    }

    .role-title,
    .board-title {
      font-size: 1.25rem;
    }

    .metadata-item {
      font-size: 0.9rem;
    }

    .production-name {
      font-size: 0.95rem;
    }

    .role-location {
      font-size: 0.85rem;
    }

    .role-description-label,
    .board-description-label {
      font-size: 1rem;
    }

    .role-description,
    .board-description {
      font-size: 0.95rem;
    }

    .more-info-button {
      font-size: 0.85rem;
      padding: 8px 20px;
      min-height: 40px;
    }

    .end-of-page {
      font-size: 0.95rem;
      margin: 32px 0;
    }
  }

  @media (min-width: ${breakpoints.md}) {
    .header-section {
      margin-bottom: 40px;
      padding: 0;
    }

    .section {
      padding: 56px 32px;
    }

    .section-title {
      font-size: 1.75rem;
      margin-bottom: 16px;
    }

    .section-description {
      font-size: 1.1rem;
      margin-bottom: 40px;
    }

    .role-list,
    .board-list {
      gap: 32px;
    }

    .role-card,
    .board-card {
      grid-template-columns: 250px 1fr;
      gap: 0;
    }

    .role-metadata {
      border-radius: 8px 0 0 8px;
      padding: 28px;
    }

    .role-title,
    .board-title {
      font-size: 1.3rem;
    }

    .production-name {
      font-size: 1rem;
    }

    .role-content,
    .board-content {
      border-radius: 0 8px 8px 0;
      padding: 28px;
    }

    .role-description-label,
    .board-description-label {
      font-size: 1.1rem;
    }

    .role-description,
    .board-description {
      font-size: 1rem;
    }

    .more-info-button {
      font-size: 0.9rem;
      padding: 10px 24px;
    }

    .board-metadata {
      border-radius: 8px 0 0 8px;
      padding: 28px;
    }

    .board-commitment {
      font-size: 0.9rem;
    }

    .board-content {
      border-radius: 0 8px 8px 0;
      padding: 28px;
    }

    .end-of-page {
      font-size: 1rem;
      margin: 40px 0;
      padding: 0;
    }
  }

  @media (min-width: ${breakpoints.lg}) {
    .role-card,
    .board-card {
      grid-template-columns: 300px 1fr;
    }
  }
`;

export default GetInvolvedPageFrame;
