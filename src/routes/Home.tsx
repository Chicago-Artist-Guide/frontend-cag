import React, { useState } from 'react';
import Hero from '/hero.png';
import Collapsible from '../components/layout/Collapsible';
import Donate from '/donate.png';
import { InputField } from '../components/shared';
import { homeFAQ } from '../components/FAQ/homeFAQ';
import Values from '../components/Redesign/Values';
import PartnerSlider from '../components/Redesign/PartnerSlider';
import { zeffyUrl } from '../utils/marketing';
import { Link } from 'react-router-dom';

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

  const [formData, setFormData] = useState({
    FNAME: '',
    LNAME: '',
    EMAIL: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const name = formData.FNAME;
    const spaceIndex = name.indexOf(' ');

    let updatedFormData = { ...formData };

    if (spaceIndex !== -1) {
      const firstName = name.substring(0, spaceIndex).trim();
      const lastName = name.substring(spaceIndex + 1).trim();
      updatedFormData = {
        ...formData,
        FNAME: firstName,
        LNAME: lastName
      };
    } else {
      updatedFormData = {
        ...formData,
        LNAME: name
      };
    }

    setFormData(updatedFormData);

    const form = e.target;
    const url = new URL(
      'https://chicagoartistguide.us6.list-manage.com/subscribe/post'
    );
    url.searchParams.append('u', '5259e9388abb929652f950f67');
    url.searchParams.append('id', '8117d0974f');

    Object.keys(updatedFormData).forEach((key) => {
      url.searchParams.append(
        key,
        updatedFormData[key as keyof typeof updatedFormData]
      );
    });

    form.action = url.toString();
    form.method = 'POST';
    form.submit();
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
        {/* Mobile/Small screens - full background image */}
        <img
          src={Hero}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover md:hidden"
        />

        {/* Mobile/Small tablet layout */}
        <div className="relative z-10 mt-16 px-4 py-6 sm:mt-20 sm:px-6 sm:py-8 md:hidden">
          <div className="max-w-sm sm:max-w-md">
            <h2 className="pb-1 text-xs font-normal text-white sm:text-sm">
              Chicago artist guide
            </h2>
            <h1 className="pb-3 text-xl font-bold leading-tight text-white sm:text-2xl">
              Find your next role at any stage.
            </h1>
            <h3 className="py-2 text-xs leading-relaxed text-white sm:text-sm">
              Diversifying theatre one FREE connection at a time.
            </h3>
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/sign-up" className="w-full">
                <button className="w-full rounded-full bg-mint px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-mint/90 sm:py-3 sm:text-base">
                  Join Now
                </button>
              </Link>
              <p className="text-xs text-white sm:text-sm">
                Totally Free, Locally Provided.
              </p>
            </div>
          </div>
        </div>

        {/* Tablet/Desktop layout - side by side */}
        <div className="relative z-10 hidden md:block md:bg-white">
          <div className="grid md:min-h-[547px] md:grid-cols-2 md:items-center">
            {/* Left column - Text content */}
            <div className="md:px-12 md:py-16 lg:px-16 xl:px-24">
              <div className="max-w-lg">
                <h2 className="pb-1 text-base font-normal text-darkGrey md:text-lg">
                  Chicago artist guide
                </h2>
                <h1 className="pb-4 text-2xl font-bold leading-tight text-darkGrey md:text-4xl lg:text-5xl">
                  Find your next role at any stage.
                </h1>
                <h3 className="py-2 text-base leading-relaxed text-darkGrey md:text-lg">
                  Diversifying theatre one FREE connection at a time.
                </h3>
                <div className="flex flex-col gap-3 pt-6">
                  <Link to="/sign-up" className="w-fit">
                    <button className="rounded-full bg-mint px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-mint/90">
                      Join Now
                    </button>
                  </Link>
                  <p className="text-sm text-darkGrey">
                    Totally Free, Locally Provided.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Image */}
            <div className="md:p-8 lg:p-12">
              <img
                src={Hero}
                alt="Hero"
                className="h-full w-full rounded-lg object-cover md:min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center px-4 sm:mt-10 sm:px-6 md:mt-12 md:px-0">
        <Values />
      </div>
      {/* Partners section - updated with slider */}
      <div className="mt-8 flex w-full justify-center bg-white sm:mt-10 md:mt-12">
        <div className="flex w-full max-w-7xl flex-col items-center p-4 sm:p-6">
          <h2 className="max-w-xl pt-4 text-center text-2xl font-bold sm:pt-6 sm:text-3xl md:text-4xl lg:text-5xl">
            Our Theatre Company Members
          </h2>
          <div className="my-8 w-full sm:my-10 md:my-12">
            <PartnerSlider partners={partners} />
          </div>
        </div>
      </div>
      {/* FAQ */}
      <div className="mx-4 my-16 grid grid-cols-1 gap-6 sm:mx-8 sm:my-20 md:mx-12 md:my-24 lg:grid-cols-3 lg:gap-0">
        <div className="col-span-1 flex items-center justify-center lg:justify-start">
          <h1 className="text-center text-xl text-black sm:text-2xl md:text-3xl lg:text-left lg:text-4xl xl:text-5xl">
            Frequently
            <br />
            Asked
            <br />
            Questions
          </h1>
        </div>
        <div className="col-span-1 lg:col-span-2 lg:mx-12">
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
        <div className="w-full max-w-7xl p-4 sm:p-6">
          <div className="my-6 grid grid-cols-1 items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-12">
            <div className="order-2 flex flex-col md:order-1">
              <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">
                Help us diversify the Chicago theatre community!
              </h2>
              <h3 className="pt-2 text-sm leading-relaxed sm:text-base">
                Your support of the Chicago Artist Guide helps us offer this
                platform to our users free of cost.
              </h3>
              <a href={zeffyUrl} target="_blank" className="mt-4 md:w-fit">
                <button className="w-full rounded-full bg-salmon px-8 py-3 text-center text-lg font-semibold text-white hover:bg-blush sm:px-12 sm:text-xl md:w-fit md:px-14">
                  Donate
                </button>
              </a>
            </div>
            <div className="order-1 flex items-center justify-center md:order-2">
              <img
                src={Donate}
                alt="Group of people happily posing"
                className="h-auto max-w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <h2 className="mt-16 text-center text-lg font-medium text-evergreen sm:mt-20 sm:text-xl md:mt-24 md:text-2xl">
          Stay up to date with the Chicago Artist Guide's Newsletter
        </h2>
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="mt-6 flex flex-col justify-center gap-4 sm:mt-8 md:mx-auto md:mt-10 md:max-w-4xl md:flex-row md:gap-4 lg:gap-6"
        >
          <div className="flex-1 md:max-w-xs lg:max-w-sm">
            <InputField
              placeholder="First & Last Name"
              value={formData.FNAME}
              id="FNAME"
              name="FNAME"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1 md:max-w-xs lg:max-w-sm">
            <InputField
              placeholder="Email Address"
              value={formData.EMAIL}
              id="EMAIL"
              name="EMAIL"
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:flex-shrink-0">
            <button
              type="submit"
              className="w-full rounded-full bg-mint px-6 py-3 text-sm font-semibold text-white hover:bg-mint/90 sm:text-base md:w-auto md:px-8 lg:px-12"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Home;
