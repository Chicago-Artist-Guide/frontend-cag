import React, { useState } from 'react';

type MemberType = 'Artists' | 'Theatres';

const artistValues = [
  {
    id: 1,
    prop: 'find work',
    description:
      'Find work on an even playing field with our accessible, centralized job board for creatives',
    col: 'col-span-1',
    order: 1
  },
  {
    id: 2,
    prop: 'self-identify',
    description:
      'Get noticed for the right roles by self-identifying your demographics with our customized search engine',
    col: 'col-span-2',
    order: 2
  },
  {
    id: 3,
    prop: 'auto-format your resume',
    description:
      'A simple sign up process that auto-formats your experience into a standardized resume so you can get noticed immediately',
    col: 'col-span-2',
    order: 3
  },
  {
    id: 4,
    prop: 'easy apply',
    description: 'Easily submit for shows and apply for jobs with one click',
    col: 'col-span-1',
    order: 4
  }
];

const theatreValues = [
  {
    id: 1,
    prop: 'add shows',
    description:
      'Add a show you’re producing and manage roles & jobs you are casting & hiring for',
    col: 'col-span-1',
    order: 2
  },
  {
    id: 2,
    prop: 'cast diverse talent',
    description:
      'Cast ethically and authentically by using our customized talent matching engine to find the right person for the role',
    col: 'col-span-2',
    order: 4
  },
  {
    id: 3,
    prop: 'track your casting process',
    description:
      'Add quick labels, sort your candidates, and batch email responses based on your choices',
    col: 'col-span-2',
    order: 1
  },
  {
    id: 4,
    prop: 'explore talent directory',
    description: 'Proactively find and invite artists to audition or interview',
    order: 3
  }
];

const Values = () => {
  const [member, setMember] = useState<MemberType>('Artists');

  const handleClick = (value: MemberType) => {
    setMember(value);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white">
      {/* Title */}
      <div className="relative m-12 text-darkGrey">
        <div className="flex items-start">
          <h1 className="mr-3 text-4xl italic text-mint">Find</h1>
          <div className="relative h-10 w-[700px] overflow-hidden">
            <h1
              className={`absolute w-full text-4xl transition-transform duration-500 ease-in-out ${
                member === 'Artists' ? 'translate-y-0' : '-translate-y-full'
              }`}
            >
              your next creative opportunity
            </h1>
            <h1
              className={`absolute w-full text-4xl transition-transform duration-500 ease-in-out ${
                member === 'Artists' ? 'translate-y-full' : 'translate-y-0'
              }`}
            >
              unique talent for your productions
            </h1>
          </div>
        </div>
      </div>
      {/* Toggle */}
      <div className="flex w-fit items-center rounded-full bg-darkGrey p-2">
        <button
          onClick={() => handleClick('Artists')}
          className={`transition-bg rounded-full px-4 py-1 duration-300 ${
            member === 'Artists' ? 'bg-mint' : 'bg-transparent'
          }`}
        >
          <h2 className="text-base font-bold text-white md:text-2xl">
            Artists
          </h2>
        </button>
        <button
          onClick={() => handleClick('Theatres')}
          className={`transition-bg ml-1 rounded-full px-4 py-1 duration-300 ${
            member === 'Theatres' ? 'bg-mint' : 'bg-transparent'
          }`}
        >
          <h2 className="text-base font-bold text-white md:text-2xl">
            Theatres
          </h2>
        </button>
      </div>
      {/* Values */}
      <div className="my-12"></div>
    </div>
  );
};

export default Values;
