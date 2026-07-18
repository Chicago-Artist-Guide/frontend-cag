'use client';

import styled from 'styled-components';
import { breakpoints, colors, fonts } from '../../../../src/theme/styleVars';

const DonatePageFrame = styled.div`
  .hero-section-wrapper {
    background: ${colors.white};
    padding: 48px 24px;
  }

  .hero-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .hero-content {
    flex: 2;
  }

  .page-title {
    font-family: ${fonts.montserrat};
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.secondaryFontColor};
    margin-bottom: 24px;
    line-height: 1.2;
  }

  .hero-subtitle,
  .hero-description {
    font-family: ${fonts.mainFont};
    font-size: 1rem;
    line-height: 1.6;
    color: ${colors.mainFont};
    margin-bottom: 20px;
  }

  .hero-bold-text {
    font-family: ${fonts.mainFont};
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.6;
    color: ${colors.mainFont};
    margin: 0;
  }

  .donation-sidebar {
    flex: 1;
    background: ${colors.bodyBg};
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .sidebar-text {
    font-family: ${fonts.mainFont};
    font-size: 0.95rem;
    line-height: 1.5;
    color: ${colors.mainFont};
    margin-bottom: 24px;
  }

  .donate-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: ${colors.mint};
    color: ${colors.white};
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 16px;
    border-radius: 24px;
    padding: 14px 28px;
    text-decoration: none;
    width: 100%;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
    margin-bottom: 20px;

    &:hover {
      background: ${colors.darkPrimary};
      transform: scale(1.02);
      text-decoration: none;
      color: ${colors.white};
    }
  }

  .tax-deductible-text {
    font-family: ${fonts.mainFont};
    font-size: 0.8125rem;
    line-height: 1.4;
    color: #666;
    margin: 0;
  }

  .sticky-donate-cta {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: ${colors.mint};
    color: ${colors.white};
    padding: 16px 24px;
    text-align: center;
    text-decoration: none;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.2s ease;

    &:hover {
      background: ${colors.darkPrimary};
      text-decoration: none;
      color: ${colors.white};
    }
  }

  .section-content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .where-it-goes-section,
  .sponsors-section {
    padding: 64px 0;
    background: ${colors.bodyBg};
  }

  .section-title {
    font-family: ${fonts.montserrat};
    font-size: 1.75rem;
    font-weight: 700;
    color: ${colors.mainFont};
    text-align: center;
    margin-bottom: 40px;
  }

  .impact-layout-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }

  .impact-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .center-image-wrapper {
    width: 100%;
    max-width: 400px;
    margin: 20px 0;
    display: none;

    img {
      width: 100%;
      height: auto;
      border-radius: 16px;
    }
  }

  .impact-card {
    background: ${colors.white};
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .icon-wrapper {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${colors.bodyBg};
    border-radius: 12px;
    padding: 8px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .impact-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .impact-title {
    font-family: ${fonts.montserrat};
    font-size: 1.125rem;
    font-weight: 700;
    color: ${colors.secondaryFontColor};
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .impact-description {
    font-family: ${fonts.mainFont};
    font-size: 0.875rem;
    line-height: 1.5;
    color: #555;
    margin: 0;
  }

  .corporate-sponsorship-section {
    padding: 64px 0;
    background: ${colors.white};
  }

  .sponsorship-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 40px;
  }

  .sponsorship-text {
    font-family: ${fonts.mainFont};
    font-size: 1rem;
    line-height: 1.6;
    color: ${colors.mainFont};
    margin: 0;
  }

  .ways-to-help-title {
    font-family: ${fonts.montserrat};
    font-size: 1.125rem;
    font-weight: 700;
    color: ${colors.secondaryFontColor};
    margin-bottom: 16px;
    line-height: 1.3;
  }

  .ways-to-help-list {
    font-family: ${fonts.mainFont};
    font-size: 1rem;
    line-height: 1.7;
    color: ${colors.mainFont};
    margin: 0;
    padding-left: 24px;

    li {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .contact-info {
    font-family: ${fonts.mainFont};
    font-size: 1rem;
    line-height: 1.6;
    color: ${colors.mainFont};
    text-align: center;
    margin: 0;

    a {
      color: ${colors.mint};
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;

      &:hover {
        color: ${colors.darkPrimary};
        text-decoration: underline;
      }
    }
  }

  @media (min-width: ${breakpoints.sm}) {
    .page-title {
      font-size: 2.5rem;
    }

    .section-title {
      font-size: 2rem;
    }
  }

  @media (min-width: ${breakpoints.md}) {
    .hero-section-wrapper {
      padding: 64px 48px;
    }

    .hero-section {
      flex-direction: row;
      gap: 48px;
      align-items: flex-start;
    }

    .page-title {
      font-size: 3rem;
    }

    .hero-subtitle,
    .hero-description,
    .hero-bold-text {
      font-size: 1.125rem;
      line-height: 1.7;
    }

    .donation-sidebar {
      display: block;
      padding: 32px;
    }

    .sidebar-text {
      font-size: 1rem;
    }

    .tax-deductible-text {
      font-size: 0.875rem;
    }

    .sticky-donate-cta {
      display: none;
    }

    .section-content-wrapper {
      padding: 0 48px;
    }

    .where-it-goes-section,
    .corporate-sponsorship-section,
    .sponsors-section {
      padding: 80px 0;
    }

    .section-title {
      font-size: 2.25rem;
      margin-bottom: 48px;
    }

    .impact-card {
      padding: 24px;
    }

    .icon-wrapper {
      width: 64px;
      height: 64px;
      padding: 10px;
    }

    .impact-title {
      font-size: 1.1875rem;
    }

    .impact-description {
      font-size: 0.9375rem;
    }

    .sponsorship-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 48px;
      margin-bottom: 48px;
    }

    .sponsorship-text,
    .ways-to-help-list,
    .contact-info {
      font-size: 1.0625rem;
    }

    .ways-to-help-title {
      font-size: 1.25rem;
    }
  }

  @media (min-width: ${breakpoints.lg}) {
    .hero-section-wrapper {
      padding: 80px 64px;
    }

    .hero-section {
      gap: 64px;
    }

    .section-content-wrapper {
      padding: 0 64px;
    }

    .where-it-goes-section,
    .corporate-sponsorship-section,
    .sponsors-section {
      padding: 96px 0;
    }

    .section-title {
      font-size: 2.5rem;
    }

    .impact-layout-wrapper {
      flex-direction: row;
      gap: 32px;
      align-items: flex-start;
      justify-content: space-between;
    }

    .impact-column {
      flex: 1;
      max-width: 320px;
    }

    .center-image-wrapper {
      display: block;
      flex: 0 0 auto;
      max-width: 450px;
    }

    .sponsorship-grid {
      gap: 64px;
    }
  }
`;

export default DonatePageFrame;
