import React from 'react';
import Hero from '/hero.png';
import Collapsible from '../components/layout/Collapsible';
import Donate from '/donate.png';
import { InputField } from '../components/shared';
import { homeFAQ } from '../components/FAQ/homeFAQ';
import Values from '../components/Redesign/Values';

const Redesign = () => {
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
      <div className="" key={props.id}>
        <p>{props.answer}</p>
      </div>
    );
  };

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
          <a href="/sign-up">
            <button className="mt-12 w-full rounded-full bg-butter px-14 py-2 text-lg font-semibold text-white hover:bg-yellow md:py-3 lg:w-fit">
              Join Now
            </button>
          </a>
        </div>
      </div>
      <Values />
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
                Help us diversify the Chicago theater community!
              </h2>
              <h3 className="pt-2 text-base leading-loose">
                Your support of the Chicago Artist Guide helps us offer this
                platform to our users free of cost.
              </h3>
              <a href="/donate">
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
        <h2 className="mt-24 text-center text-2xl text-slate">
          Stay up to date with the Chicago Artist Guide’s Newsletter
        </h2>
        <div className="flex justify-center gap-24">
          <InputField placeholder="First and Last Name" />
          <InputField placeholder="Email" />
          <button className="mt-4 rounded-full bg-mint px-14 py-2 text-xl font-semibold text-white hover:bg-darkGrey">
            Keep me posted!
          </button>
        </div>
      </div>
    </>
  );
};

export default Redesign;
