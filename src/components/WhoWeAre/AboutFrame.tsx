'use client';

import styled from 'styled-components';

const AboutFrame = styled.div`
  .header-section {
    margin-bottom: 32px;
    text-align: center;

    @media (min-width: 768px) {
      margin-bottom: 48px;
    }
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 24px;
    color: #2f4550;
    text-transform: uppercase;

    @media (min-width: 640px) {
      font-size: 2.5rem;
      margin-bottom: 32px;
    }

    @media (min-width: 768px) {
      font-size: 3rem;
      margin-bottom: 40px;
    }
  }

  .divider-bar {
    width: 100%;
    max-width: 200px;
    height: 3px;
    border-radius: 2px;
    margin: 0 auto;
    background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);

    @media (min-width: 640px) {
      max-width: 250px;
      height: 4px;
    }

    @media (min-width: 768px) {
      max-width: 300px;
    }
  }

  .about-section {
    margin-bottom: 48px;

    @media (min-width: 768px) {
      margin-bottom: 64px;
    }
  }

  .vision-mission-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;

    @media (min-width: 768px) {
      flex-direction: row;
      gap: 32px;
    }

    @media (min-width: 1024px) {
      gap: 48px;
    }
  }

  .about-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    flex: 1;

    @media (min-width: 640px) {
      padding: 32px;
    }

    @media (min-width: 768px) {
      padding: 36px;
    }
  }

  .about-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #2f4550;

    @media (min-width: 640px) {
      font-size: 1.75rem;
      margin-bottom: 20px;
    }

    @media (min-width: 768px) {
      font-size: 2rem;
      margin-bottom: 24px;
    }
  }

  .about-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #444;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    @media (min-width: 640px) {
      font-size: 1.1rem;
      line-height: 1.7;
    }

    @media (min-width: 768px) {
      font-size: 1.125rem;
    }
  }

  .team-section {
    margin-top: 48px;

    @media (min-width: 768px) {
      margin-top: 64px;
    }
  }

  .meet-our-team-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 32px;
    color: #2f4550;
    text-align: center;

    @media (min-width: 640px) {
      font-size: 2rem;
      margin-bottom: 40px;
    }

    @media (min-width: 768px) {
      font-size: 2.25rem;
      margin-bottom: 48px;
      text-align: left;
    }
  }
`;

export default AboutFrame;
