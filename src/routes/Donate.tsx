import React from 'react';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import SVGLayer from '../components/SVGLayer';
import homeDance from '../images/home_dance.svg';
import SponsorCallForCulture from '../images/sponsors/callForCulture.png';
import SponsorCliffLogo from '../images/sponsors/cliff.jpg';
import SponsorLawLynx from '../images/sponsors/lawlynx.jpg';
import SponsorLetsRoam from '../images/sponsors/lets_roam_logo_horizontal_v3.jpg';
import SponsorGios from '../images/sponsors/gios.jpg';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import { breakpoints } from '../theme/styleVars';
import { zeffyUrl } from '../utils/marketing';

const Donate = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        {/* Header Section */}
        <HeaderSection>
          <HeroSection>
            <HeroContent>
              <PageTitle>DONATE</PageTitle>
              <Tagline>Support Us</Tagline>
              <DividerBar />
              <HeroText>
                Chicago Artist Guide is building an online platform that will
                connect theatres with artists and help them diversify their
                casting and hiring. Thank you for supporting our efforts to
                foster and support a more diversified Chicago theatre community!
              </HeroText>
            </HeroContent>
            <HeroGraphic>
              <SVGLayer blob={yellowBlob1} dancer={homeDance} />
            </HeroGraphic>
          </HeroSection>
        </HeaderSection>

        {/* Donation Section */}
        <DonationSection>
          <SectionTitle>Two Ways to Give</SectionTitle>

          <DonationMethodsWrapper>
            <OnlineDonationSection>
              <MethodTitle>
                <strong>1. Online:</strong>
              </MethodTitle>
              <IFrameWrapper>
                <DonationIFrame
                  allowTransparency
                  allow="payment"
                  title="Donate to Chicago Artist Guide online. Donation form powered by Zeffy."
                  src={zeffyUrl}
                >
                  <a href={zeffyUrl} target="_blank" rel="noopener noreferrer">
                    Click here to donate to CAG on Zeffy!
                  </a>
                </DonationIFrame>
              </IFrameWrapper>
            </OnlineDonationSection>

            <MailDonationSection>
              <MethodTitle>
                <strong>2. OR by mail:</strong>
              </MethodTitle>
              <MailInfo>
                <MailLabel>
                  <em>Mail a check to:</em>
                </MailLabel>
                <AddressBlock>
                  Chicago Artist Guide
                  <br />
                  c/o Anna Schutz
                  <br />
                  4814 N Damen Ave 212
                  <br />
                  Chicago, IL 60625
                </AddressBlock>
              </MailInfo>
            </MailDonationSection>
          </DonationMethodsWrapper>

          <TaxDeductibleNote>
            <em>
              Chicago Artist Guide NFP is a 501(c)(3) and donations are tax
              deductible to the fullest extent of the law.
            </em>
          </TaxDeductibleNote>
        </DonationSection>

        {/* Sponsors Section */}
        <SponsorsSection>
          <SectionDivider />
          <SectionTitle>Thank You to Our Generous Supporters</SectionTitle>
          <SponsorsGrid>
            <SponsorItem>
              <SponsorLink
                href="https://www.letsroam.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SponsorImage src={SponsorLetsRoam} alt="Let's Roam" />
              </SponsorLink>
            </SponsorItem>
            <SponsorItem>
              <SponsorLink
                href="https://cliff-chicago.org/foundation/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SponsorImage src={SponsorCliffLogo} alt="Cliff Foundation" />
              </SponsorLink>
            </SponsorItem>
            <SponsorItem>
              <SponsorLink
                href="https://callforculture.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SponsorImage
                  src={SponsorCallForCulture}
                  alt="Call for Culture"
                />
              </SponsorLink>
            </SponsorItem>
            <SponsorItem>
              <SponsorLink
                href="https://thelynxverse.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SponsorImage src={SponsorLawLynx} alt="Law Lynx" />
              </SponsorLink>
            </SponsorItem>
            <SponsorItem>
              <SponsorLink
                href="https://giosbbqbarandgrill.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SponsorImage src={SponsorGios} alt="Gio's BBQ Bar and Grill" />
              </SponsorLink>
            </SponsorItem>
          </SponsorsGrid>
        </SponsorsSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Donate;

const ContentWrapper = styled.div`
  max-width: 100%;
`;

const HeaderSection = styled.div`
  margin-bottom: 48px;

  @media (min-width: 768px) {
    margin-bottom: 64px;
  }
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 48px;
  }
`;

const HeroContent = styled.div`
  flex: 2;
  text-align: center;

  @media (min-width: 1024px) {
    text-align: left;
  }
`;

const HeroGraphic = styled.div`
  flex: 1;
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2f4550;
  text-transform: uppercase;

  @media (min-width: 640px) {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 24px;
  }
`;

const Tagline = styled.h2`
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 24px;
  color: #666;

  @media (min-width: 640px) {
    font-size: 1.5rem;
    margin-bottom: 32px;
  }
`;

const DividerBar = styled.div`
  width: 100%;
  max-width: 200px;
  height: 3px;
  border-radius: 2px;
  margin: 0 auto 32px auto;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);

  @media (min-width: 640px) {
    max-width: 250px;
    height: 4px;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    max-width: 300px;
  }

  @media (min-width: 1024px) {
    margin-left: 0;
  }
`;

const HeroText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 1.1rem;
    line-height: 1.7;
  }

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

const DonationSection = styled.div`
  margin-bottom: 64px;

  @media (min-width: 768px) {
    margin-bottom: 80px;
  }
`;

const SectionTitle = styled.h2`
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
`;

const DonationMethodsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 64px;
    align-items: flex-start;
  }
`;

const OnlineDonationSection = styled.div`
  flex: 2;
`;

const MailDonationSection = styled.div`
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;

  @media (min-width: 640px) {
    padding: 32px;
  }
`;

const MethodTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 24px;
  color: #2f4550;

  @media (min-width: 640px) {
    font-size: 1.375rem;
    margin-bottom: 32px;
  }
`;

const IFrameWrapper = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DonationIFrame = styled.iframe`
  width: 100%;
  border: none;
  height: 1620px;

  @media screen and (max-width: ${breakpoints.sm}) {
    height: 1740px;
  }

  @media screen and (max-width: 480px) {
    height: 1800px;
  }
`;

const MailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MailLabel = styled.p`
  font-size: 1rem;
  margin: 0;
  color: #666;
`;

const AddressBlock = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  color: #2f4550;
  font-weight: 500;
`;

const TaxDeductibleNote = styled.div`
  margin-top: 48px;
  padding: 24px;
  background: #f0f8ff;
  border-radius: 8px;
  text-align: center;

  em {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.5;

    @media (min-width: 640px) {
      font-size: 1rem;
    }
  }
`;

const SponsorsSection = styled.div`
  margin-top: 64px;
`;

const SectionDivider = styled.hr`
  border: none;
  height: 2px;
  background: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
  margin-bottom: 48px;

  @media (min-width: 768px) {
    margin-bottom: 64px;
  }
`;

const SponsorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  align-items: center;

  @media (min-width: 640px) {
    gap: 40px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
  }
`;

const SponsorItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;

  @media (min-width: 640px) {
    height: 140px;
  }
`;

const SponsorLink = styled.a`
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const SponsorImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;
