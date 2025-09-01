import React from 'react';
import Hero from '/hero.png';
import Collapsible from '../components/layout/Collapsible';
import Donate from '/donate.png';
import { homeFAQ } from '../components/FAQ/homeFAQ';
import Values from '../components/Redesign/Values';
import PartnerSlider from '../components/Redesign/PartnerSlider';
import { zeffyUrl } from '../utils/marketing';

// Partners
import MPaact from '../images/partners/mpaact_hq-1.jpg';
import ChicagoFringeOpera from '../images/partners/chicago-fringe-opera-1.png';
import TheStoryTheatre from '../images/partners/the-story-theatre-1.png';
import BabesBlades from '../images/partners/babes-blades-1.jpg';
import CircaPinto from '../images/partners/circa-pintig-1.jpg';
import Corn from '../images/partners/corn-1.jpg';
import GreatWorks from '../images/partners/great-works-1.jpg';
import Jackalope from '../images/partners/jackalope-1.png';
import Pegasus from '../images/partners/pegasus-logo-1.jpg';

const Home = () => {
  const sectionTitles = {
    about: 'What is Chicago Artist Guide (CAG)?',
    price: 'Is it Free?',
    profile: 'Who can make an Artist Profile?',
    jobs: 'How can my Theatre Company sign up to post jobs?',
    identity:
      'Will I be excluded from casting searches based on how I self-identify?'
  };

  const subContainer = (props: any) => {
    return (
      <div key={props.id}>
        <p>{props.answer}</p>
      </div>
    );
  };

  const partners = [
    { src: MPaact, alt: 'MPAACT', url: 'https://www.mpaact.org/' },
    {
      src: ChicagoFringeOpera,
      alt: 'Chicago Fringe Opera',
      url: 'https://www.chicagofringeopera.com/'
    },
    {
      src: TheStoryTheatre,
      alt: 'The Story Theatre',
      url: 'https://thestorytheatre.org/'
    },
    {
      src: BabesBlades,
      alt: 'Babes with Blades',
      url: 'https://babeswithblades.org/'
    },
    {
      src: CircaPinto,
      alt: 'Circa Pinto',
      url: 'https://www.circapintig.org/'
    },
    {
      src: Corn,
      alt: 'Corn',
      url: 'https://www.cornservatory.org/'
    },
    {
      src: GreatWorks,
      alt: 'Great Works',
      url: 'https://www.greatworkstheatre.com/'
    },
    {
      src: Jackalope,
      alt: 'Jackalope',
      url: 'https://www.jackalopetheatre.org/'
    },
    {
      src: Pegasus,
      alt: 'Pegasus',
      url: 'https://pegasustheatrechicago.org/'
    }
  ];

  return (
    <>
      {/* Hero */}
      <div className="relative">
        <img
          src={Hero}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 mt-24 px-6 py-8 md:px-12 md:py-24 lg:px-36 lg:py-36 xl:px-64 xl:py-48">
          <h1 className="pb-3 text-2xl text-white md:text-5xl lg:text-7xl">
            Discover your next
            <br />
            dream gig
          </h1>
          <h3 className="md:text-md py-2 text-xs font-medium leading-loose text-white md:text-lg lg:text-xl">
            {' '}
            Sign up for our network and have your next opportunity find you.
          </h3>
          <h3 className="pt-3 text-xs font-light text-white md:text-sm lg:text-base">
            Free for everyone. Proudly made in Chicago.
          </h3>
          <div className="mt-12 flex flex-col gap-4 md:flex-row">
            <a href="/sign-up">
              <button className="w-full rounded-full bg-butter px-14 py-2 text-lg font-semibold text-white hover:bg-yellow md:py-3 lg:w-fit">
                Join Now
              </button>
            </a>
            <a href="/shows">
              <button className="w-full rounded-full bg-mint px-14 py-2 text-lg font-semibold text-white hover:bg-mint/80 md:py-3 lg:w-fit">
                Browse Shows
              </button>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-12 flex justify-center">
        <Values />
      </div>
      {/* Partners section - updated with slider */}
      <div className="mt-12 flex w-full justify-center bg-white">
        <div className="flex w-full max-w-7xl flex-col items-center p-6">
          <h2 className="max-w-xl pt-6 text-center text-5xl">
            Our Theatre Company Members
          </h2>
          <div className="my-12 w-full">
            <PartnerSlider partners={partners} />
          </div>
        </div>
      </div>
      {/* FAQ */}
      <div className="mx-12 my-24 grid grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1 flex items-center justify-center">
          <h1 className="text-3xl text-black md:text-4xl lg:text-5xl">
            Frequently
            <br />
            Asked
            <br />
            Questions
          </h1>
        </div>
        <div className="col-span-2 mx-12">
          <Collapsible
            sectionTitles={sectionTitles}
            subSections={homeFAQ}
            subContainer={subContainer}
            grid={false}
          />
        </div>
      </div>
      {/* Diversify max-w-7xl */}
      <div className="flex w-full justify-center bg-white">
        <div className="w-full max-w-7xl p-6">
          <div className="my-6 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="order-2 flex flex-col md:order-1">
              <h2 className="text-xl md:text-3xl">
                Help us diversify the Chicago theatre community!
              </h2>
              <h3 className="pt-2 text-base leading-loose">
                Your support of the Chicago Artist Guide helps us offer this
                platform to our users free of cost.
              </h3>
              <a href={zeffyUrl} target="_blank">
                <button className="mt-4 w-full rounded-full bg-salmon px-14 py-3 text-center text-xl font-semibold text-white hover:bg-blush md:w-fit">
                  Donate
                </button>
              </a>
            </div>
            <div className="order-1 flex items-center justify-center md:order-2">
              <img src={Donate} alt="Group of people happily posing" />
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div>
        <h2 className="mt-24 px-2 text-start text-2xl text-evergreen md:text-center">
          Stay up to date with the Chicago Artist Guide’s Newsletter
        </h2>
        <div className="px-5 md:px-10">
          <div className="relative h-96 w-full">
            <iframe
              title="Signup form powered by Zeffy"
              style={{
                position: 'absolute',
                border: 0,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: '100%',
                height: '100%'
              }}
              src="https://www.zeffy.com/en-US/embed/newsletter-form/sign-up-for-our-newsletter-859"
              allowTransparency={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
