import React from 'react';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import PartnerSlider from '../components/Redesign/PartnerSlider';
import { breakpoints, colors, fonts } from '../theme/styleVars';
import { zeffyUrl } from '../utils/marketing';

// Additional sponsor images (for other sections)
import SponsorCallForCulture from '../images/sponsors/callForCulture.png';
import SponsorCliffLogo from '../images/sponsors/cliff.jpg';
import SponsorLetsRoam from '../images/sponsors/lets_roam_logo_horizontal_v3.jpg';

import { supporters as corporateSponsors } from '../utils/supporters';

// Donate impact icons
import KeysIcon from '../images/donate/keys.png';
import StageBowIcon from '../images/donate/stage_bow.png';
import CoinsIcon from '../images/donate/coins.png';
import SignBoardIcon from '../images/donate/sign_board.png';
import LaptopIcon from '../images/donate/laptop.png';
import StageLightIcon from '../images/donate/stage_light.png';

const Donate = () => {
  return (
    <PageContainer className="!px-0 !py-0">
      <ContentWrapper>
        {/* Hero Section */}
        <HeroSectionWrapper>
          <HeroSection>
            <HeroContent>
              <PageTitle>Donate to Support Chicago Artists</PageTitle>
              <HeroSubtitle>
                Chicago Artist Guide connects local theatre companies with
                diverse on- and off-stage talent — building a more inclusive and
                representative creative community.
              </HeroSubtitle>
              <HeroDescription>
                Your donation helps us keep the platform free for artists and
                theatres while funding outreach, education, and community
                programming.
              </HeroDescription>
              <HeroBoldText>
                Every dollar goes directly toward supporting our mission — and
                thanks to our ZERO-FEE donation processor powered by Zeffy, your
                full contribution reaches us.
              </HeroBoldText>
            </HeroContent>

            <DonationSidebar>
              <SidebarText>
                Donate securely through our form which accepts credit cards,
                debit cards, Apple Pay, Google Pay, checks and bank transfers.
              </SidebarText>
              <DonateButton
                href={zeffyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Donate Securely Now
                <ArrowIcon>↗</ArrowIcon>
              </DonateButton>
              <TaxDeductibleText>
                Chicago Artist Guide NFP is a 501(c)(3) and donations are tax
                deductible to the fullest extent of the law.
              </TaxDeductibleText>
            </DonationSidebar>
          </HeroSection>
        </HeroSectionWrapper>

        {/* Mobile Sticky CTA */}
        <StickyDonateCTA
          href={zeffyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate Securely Now
          <ArrowIcon>↗</ArrowIcon>
        </StickyDonateCTA>

        {/* Where Your Donation Goes Section */}
        <WhereItGoesSection>
          <SectionContentWrapper>
            <SectionTitle>Where your donation goes</SectionTitle>
            <ImpactLayoutWrapper>
              <ImpactColumn>
                <ImpactCard>
                  <IconWrapper>
                    <img src={KeysIcon} alt="Keys" />
                  </IconWrapper>
                  <ImpactContent>
                    <ImpactTitle>Artist Access</ImpactTitle>
                    <ImpactDescription>
                      Maintaining a free, inclusive talent platform
                    </ImpactDescription>
                  </ImpactContent>
                </ImpactCard>

                <ImpactCard>
                  <IconWrapper>
                    <img src={SignBoardIcon} alt="Sign Board" />
                  </IconWrapper>
                  <ImpactContent>
                    <ImpactTitle>Community Programs</ImpactTitle>
                    <ImpactDescription>
                      Workshops and networking for emerging artists
                    </ImpactDescription>
                  </ImpactContent>
                </ImpactCard>

                <ImpactCard>
                  <IconWrapper>
                    <img src={CoinsIcon} alt="Coins" />
                  </IconWrapper>
                  <ImpactContent>
                    <ImpactTitle>Pay Equity</ImpactTitle>
                    <ImpactDescription>
                      Ensure our team is paid fairly for their time
                    </ImpactDescription>
                  </ImpactContent>
                </ImpactCard>
              </ImpactColumn>

              <CenterImageWrapper>
                <img src={StageBowIcon} alt="Theater Stage" />
              </CenterImageWrapper>

              <ImpactColumn>
                <ImpactCard>
                  <IconWrapper>
                    <img src={StageLightIcon} alt="Stage Light" />
                  </IconWrapper>
                  <ImpactContent>
                    <ImpactTitle>Theatre Diversity</ImpactTitle>
                    <ImpactDescription>
                      Tools and resources for equitable casting
                    </ImpactDescription>
                  </ImpactContent>
                </ImpactCard>

                <ImpactCard>
                  <IconWrapper>
                    <img src={LaptopIcon} alt="Laptop" />
                  </IconWrapper>
                  <ImpactContent>
                    <ImpactTitle>Technology & Accessibility</ImpactTitle>
                    <ImpactDescription>
                      Ongoing improvements to make the site more user-friendly
                      and inclusive
                    </ImpactDescription>
                  </ImpactContent>
                </ImpactCard>
              </ImpactColumn>
            </ImpactLayoutWrapper>
          </SectionContentWrapper>
        </WhereItGoesSection>

        {/* Corporate Sponsorship Opportunities Section */}
        <CorporateSponsorshipSection>
          <SectionContentWrapper>
            <SectionTitle>Corporate Sponsorship Opportunities</SectionTitle>
            <SponsorshipGrid>
              <SponsorshipColumn>
                <SponsorshipText>
                  Is your company looking to support Diversity, Equity, and
                  Inclusion, the arts, and Chicago economic growth? We want to
                  work with you! For as little as $500 a year, you can take part
                  of CAG's community programming, social media and email
                  marketing, and promotion at our annual "A Night at the
                  CAG-Baret" gala.
                </SponsorshipText>
              </SponsorshipColumn>
              <SponsorshipColumn>
                <WaysToHelpTitle>Other ways you can help:</WaysToHelpTitle>
                <WaysToHelpList>
                  <li>
                    In-kind donations (silent auction items, free space for
                    events)
                  </li>
                  <li>Sharing this with other potential sponsor companies</li>
                  <li>
                    Checking if your company offers any grant, volunteer, or
                    matching benefits
                  </li>
                </WaysToHelpList>
              </SponsorshipColumn>
            </SponsorshipGrid>
            <ContactInfo>
              For more information please contact our Executive Director,{' '}
              <a href="mailto:anna@chicagoartistguide.org">Anna Schutz</a>.
            </ContactInfo>
          </SectionContentWrapper>
        </CorporateSponsorshipSection>

        {/* Sponsors Carousel Section */}
        <SponsorsSection>
          <SectionContentWrapper>
            <SectionTitle>Chicago Artist Guide is Supported By</SectionTitle>
            <CarouselWrapper>
              <PartnerSlider partners={corporateSponsors} staticMode={true} />
            </CarouselWrapper>
          </SectionContentWrapper>
        </SponsorsSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Donate;

// Styled Components
const ContentWrapper = styled.div`
  max-width: 100%;
`;

const HeroSectionWrapper = styled.div`
  background: ${colors.white};
  padding: 48px 24px;

  @media (min-width: ${breakpoints.md}) {
    padding: 64px 48px;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 80px 64px;
  }
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;

  @media (min-width: ${breakpoints.md}) {
    flex-direction: row;
    gap: 48px;
    align-items: flex-start;
  }

  @media (min-width: ${breakpoints.lg}) {
    gap: 64px;
  }
`;

const HeroContent = styled.div`
  flex: 2;
`;

const PageTitle = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 2rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 24px;
  line-height: 1.2;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 2.5rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  line-height: 1.6;
  color: ${colors.mainFont};
  margin-bottom: 20px;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.125rem;
    line-height: 1.7;
  }
`;

const HeroDescription = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  line-height: 1.6;
  color: ${colors.mainFont};
  margin-bottom: 20px;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.125rem;
    line-height: 1.7;
  }
`;

const HeroBoldText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.6;
  color: ${colors.mainFont};
  margin: 0;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.125rem;
    line-height: 1.7;
  }
`;

const DonationSidebar = styled.div`
  flex: 1;
  background: ${colors.bodyBg};
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: none;

  @media (min-width: ${breakpoints.md}) {
    display: block;
    padding: 32px;
  }
`;

const SidebarText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 0.95rem;
  line-height: 1.5;
  color: ${colors.mainFont};
  margin-bottom: 24px;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
  }
`;

const DonateButton = styled.a`
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
`;

const TaxDeductibleText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #666;
  margin: 0;

  @media (min-width: ${breakpoints.md}) {
    font-size: 0.875rem;
  }
`;

const StickyDonateCTA = styled.a`
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

  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`;

const ArrowIcon = styled.span`
  font-size: 18px;
  line-height: 1;
`;

const SectionContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;

  @media (min-width: ${breakpoints.md}) {
    padding: 0 48px;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 0 64px;
  }
`;

const WhereItGoesSection = styled.section`
  padding: 64px 0;
  background: ${colors.bodyBg};

  @media (min-width: ${breakpoints.md}) {
    padding: 80px 0;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 96px 0;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-size: 1.75rem;
  font-weight: 700;
  color: ${colors.mainFont};
  text-align: center;
  margin-bottom: 40px;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 2rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 2.25rem;
    margin-bottom: 48px;
  }

  @media (min-width: ${breakpoints.lg}) {
    font-size: 2.5rem;
  }
`;

const ImpactLayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;

  @media (min-width: ${breakpoints.lg}) {
    flex-direction: row;
    gap: 32px;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const ImpactColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media (min-width: ${breakpoints.lg}) {
    flex: 1;
    max-width: 320px;
  }
`;

const CenterImageWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 20px 0;
  display: none;

  img {
    width: 100%;
    height: auto;
    border-radius: 16px;
  }

  @media (min-width: ${breakpoints.lg}) {
    display: block;
    flex: 0 0 auto;
    max-width: 450px;
  }
`;

const ImpactCard = styled.div`
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

  @media (min-width: ${breakpoints.md}) {
    padding: 24px;
  }
`;

const IconWrapper = styled.div`
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

  @media (min-width: ${breakpoints.md}) {
    width: 64px;
    height: 64px;
    padding: 10px;
  }
`;

const ImpactContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ImpactTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.125rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 6px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1875rem;
  }
`;

const ImpactDescription = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 0.875rem;
  line-height: 1.5;
  color: #555;
  margin: 0;

  @media (min-width: ${breakpoints.md}) {
    font-size: 0.9375rem;
  }
`;

const CorporateSponsorshipSection = styled.section`
  padding: 64px 0;
  background: ${colors.white};

  @media (min-width: ${breakpoints.md}) {
    padding: 80px 0;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 96px 0;
  }
`;

const SponsorshipGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 40px;

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 48px;
    margin-bottom: 48px;
  }

  @media (min-width: ${breakpoints.lg}) {
    gap: 64px;
  }
`;

const SponsorshipColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const SponsorshipText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  line-height: 1.6;
  color: ${colors.mainFont};
  margin: 0;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.0625rem;
  }
`;

const WaysToHelpTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.125rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 16px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.25rem;
  }
`;

const WaysToHelpList = styled.ul`
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

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.0625rem;
  }
`;

const ContactInfo = styled.p`
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

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.0625rem;
  }
`;

const SponsorsSection = styled.section`
  padding: 64px 0;
  background: ${colors.bodyBg};

  @media (min-width: ${breakpoints.md}) {
    padding: 80px 0;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 96px 0;
  }
`;

const CarouselWrapper = styled.div`
  width: 100%;
`;
