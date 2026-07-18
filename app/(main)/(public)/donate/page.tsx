import React from 'react';
import PageContainer from '../../../../src/components/layout/PageContainer';
import {
  CoinsIcon,
  KeysIcon,
  LaptopIcon,
  SignBoardIcon,
  StageBowIcon,
  StageLightIcon
} from '../../../../src/config/publicImages';
import { zeffyUrl } from '../../../../src/utils/marketing';
import { supporters } from '../../../../src/utils/supporters';
import DonatePageFrame from './donate-page-frame';

const DonatePage = () => (
  <PageContainer className="!px-0 !py-0">
    <DonatePageFrame className="max-w-full">
      <div className="hero-section-wrapper">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="page-title">Donate to Support Chicago Artists</h1>
            <p className="hero-subtitle">
              Chicago Artist Guide connects local theatre companies with diverse
              on- and off-stage talent — building a more inclusive and
              representative creative community.
            </p>
            <p className="hero-description">
              Your donation helps us keep the platform free for artists and
              theatres while funding outreach, education, and community
              programming.
            </p>
            <p className="hero-bold-text">
              Every dollar goes directly toward supporting our mission — and
              thanks to our ZERO-FEE donation processor powered by Zeffy, your
              full contribution reaches us.
            </p>
          </div>

          <div className="donation-sidebar">
            <p className="sidebar-text">
              Donate securely through our form which accepts credit cards, debit
              cards, Apple Pay, Google Pay, checks and bank transfers.
            </p>
            <a
              className="donate-button"
              href={zeffyUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Donate Securely Now
              <span className="text-[18px] leading-[1]">↗</span>
            </a>
            <p className="tax-deductible-text">
              Chicago Artist Guide NFP is a 501(c)(3) and donations are tax
              deductible to the fullest extent of the law.
            </p>
          </div>
        </div>
      </div>

      <a
        className="sticky-donate-cta"
        href={zeffyUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Donate Securely Now
        <span className="text-[18px] leading-[1]">↗</span>
      </a>

      <section className="where-it-goes-section">
        <div className="section-content-wrapper">
          <h2 className="section-title">Where your donation goes</h2>
          <div className="impact-layout-wrapper">
            <div className="impact-column">
              <div className="impact-card">
                <div className="icon-wrapper">
                  <img alt="Keys" src={KeysIcon} />
                </div>
                <div className="impact-content">
                  <h3 className="impact-title">Artist Access</h3>
                  <p className="impact-description">
                    Maintaining a free, inclusive talent platform
                  </p>
                </div>
              </div>

              <div className="impact-card">
                <div className="icon-wrapper">
                  <img alt="Sign Board" src={SignBoardIcon} />
                </div>
                <div className="impact-content">
                  <h3 className="impact-title">Community Programs</h3>
                  <p className="impact-description">
                    Workshops and networking for emerging artists
                  </p>
                </div>
              </div>

              <div className="impact-card">
                <div className="icon-wrapper">
                  <img alt="Coins" src={CoinsIcon} />
                </div>
                <div className="impact-content">
                  <h3 className="impact-title">Pay Equity</h3>
                  <p className="impact-description">
                    Ensure our team is paid fairly for their time
                  </p>
                </div>
              </div>
            </div>

            <div className="center-image-wrapper">
              <img alt="Theater Stage" src={StageBowIcon} />
            </div>

            <div className="impact-column">
              <div className="impact-card">
                <div className="icon-wrapper">
                  <img alt="Stage Light" src={StageLightIcon} />
                </div>
                <div className="impact-content">
                  <h3 className="impact-title">Theatre Diversity</h3>
                  <p className="impact-description">
                    Tools and resources for equitable casting
                  </p>
                </div>
              </div>

              <div className="impact-card">
                <div className="icon-wrapper">
                  <img alt="Laptop" src={LaptopIcon} />
                </div>
                <div className="impact-content">
                  <h3 className="impact-title">Technology & Accessibility</h3>
                  <p className="impact-description">
                    Ongoing improvements to make the site more user-friendly and
                    inclusive
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="corporate-sponsorship-section">
        <div className="section-content-wrapper">
          <h2 className="section-title">Corporate Sponsorship Opportunities</h2>
          <div className="sponsorship-grid">
            <div className="flex flex-col">
              <p className="sponsorship-text">
                Is your company looking to support Diversity, Equity, and
                Inclusion, the arts, and Chicago economic growth? We want to
                work with you! For as little as $500 a year, you can take part
                of CAG&apos;s community programming, social media and email
                marketing, and promotion at our annual &quot;A Night at the
                CAG-Baret&quot; gala.
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="ways-to-help-title">Other ways you can help:</h3>
              <ul className="ways-to-help-list">
                <li>
                  In-kind donations (silent auction items, free space for
                  events)
                </li>
                <li>Sharing this with other potential sponsor companies</li>
                <li>
                  Checking if your company offers any grant, volunteer, or
                  matching benefits
                </li>
              </ul>
            </div>
          </div>
          <p className="contact-info">
            For more information please contact our Executive Director,{' '}
            <a href="mailto:anna@chicagoartistguide.org">Anna Schutz</a>.
          </p>
        </div>
      </section>

      <section className="sponsors-section">
        <div className="section-content-wrapper">
          <h2 className="section-title">
            Chicago Artist Guide is Supported By
          </h2>
          <div className="w-full">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-6 lg:grid-cols-4 lg:gap-8">
                {supporters.map((supporter) => (
                  <div
                    className="group relative min-h-[140px] w-full overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 [aspect-ratio:16/9] hover:shadow-lg"
                    key={supporter.url}
                  >
                    <a
                      className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      href={supporter.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={supporter.alt}
                        className="h-full w-full rounded-xl object-contain p-4"
                        src={supporter.src}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DonatePageFrame>
  </PageContainer>
);

export default DonatePage;
