import React, { useState } from 'react';
import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
type MemberType = 'Artists' | 'Theatres';

type ValueDetails = {
  prop: string;
  description: string;
  col: string;
  order: number;
  animation: string;
  color: string;
  backColor: string;
  bigFont: string;
  smallFont: string;
};

type Values = {
  [key: number]: {
    Artists: ValueDetails;
    Theatres: ValueDetails;
  };
};

const values: Values = {
  1: {
    Artists: {
      prop: 'find work',
      description:
        'Find work on an even playing field with our accessible, centralized job board for creatives',
      col: 'col-span-1',
      order: 1,
      animation: 'animate-slide-left',
      color: 'bg-butter',
      backColor: 'bg-gold',
      bigFont: 'md:text-60',
      smallFont: 'text-3xl'
    },
    Theatres: {
      prop: 'add shows',
      description:
        'Add a show you’re producing and manage roles & jobs you are casting & hiring for',
      col: 'col-span-1',
      order: 2,
      animation: 'animate-slide-right',
      color: 'bg-butter',
      backColor: 'bg-gold',
      bigFont: 'md:text-50',
      smallFont: 'text-2xl'
    }
  },
  2: {
    Artists: {
      prop: 'self-identify',
      description:
        'Get noticed for the right roles by self-identifying your demographics with our customized search engine',
      col: 'col-span-2',
      order: 2,
      animation: 'animate-slide-up',
      color: 'bg-blush',
      backColor: 'bg-salmon',
      bigFont: 'md:text-80',
      smallFont: 'text-3xl'
    },
    Theatres: {
      prop: 'cast diverse talent',
      description:
        'Cast ethically and authentically by using our customized talent matching engine to find the right person for the role',
      col: 'col-span-2',
      order: 4,
      animation: 'animate-slide-down',
      color: 'bg-blush',
      backColor: 'bg-salmon',
      bigFont: 'md:text-60',
      smallFont: 'text-3xl'
    }
  },
  3: {
    Artists: {
      prop: 'auto-format your resume',
      description:
        'A simple sign up process that auto-formats your experience into a standardized resume so you can get noticed immediately',
      col: 'col-span-2',
      order: 3,
      animation: 'animate-slide-down',
      color: 'bg-mint',
      backColor: 'bg-evergreen',
      bigFont: 'md:text-50',
      smallFont: 'text-3xl'
    },
    Theatres: {
      prop: 'track your casting process',
      description:
        'Add quick labels, sort your candidates, and batch email responses based on your choices',
      col: 'col-span-2',
      order: 1,
      animation: 'animate-slide-up',
      color: 'bg-mint',
      backColor: 'bg-evergreen',
      bigFont: 'md:text-50',
      smallFont: 'text-3xl'
    }
  },
  4: {
    Artists: {
      prop: 'easy apply',
      description: 'Easily submit for shows and apply for jobs with one click',
      col: 'col-span-1',
      order: 4,
      animation: 'animate-slide-right',
      color: 'bg-cornflower',
      backColor: 'bg-darkGrey',
      bigFont: 'md:text-60',
      smallFont: 'text-3xl'
    },
    Theatres: {
      prop: 'explore talent directory',
      description:
        'Proactively find and invite artists to audition or interview',
      col: 'col-span-1',
      order: 3,
      animation: 'animate-slide-left',
      color: 'bg-cornflower',
      backColor: 'bg-darkGrey',
      bigFont: 'md:text-36',
      smallFont: 'text-lg'
    }
  }
};

const Values = () => {
  const [member, setMember] = useState<MemberType>('Artists');
  const [flipped, setFlipped] = useState([false, false, false, false]);

  const handleClick = (value: MemberType) => {
    setMember(value);
  };

  const handleFlip = (id: string) => {
    setFlipped((prevFlipped) =>
      prevFlipped.map((flippedState, index) =>
        index === Number(id) - 1 ? !flippedState : flippedState
      )
    );
  };

  return (
    <div className="xs:px-4 xs:py-8 w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-lg bg-white px-2 py-6 sm:max-w-md sm:px-6 sm:py-10 md:flex md:max-w-4xl md:px-8 md:py-12 lg:max-w-6xl lg:px-12">
      {/* Title */}
      <div className="relative text-darkGrey">
        <div className="flex items-start">
          <h1 className="mr-1 text-sm italic text-mint sm:mr-2 sm:text-lg md:mr-3 md:text-2xl lg:text-4xl">
            Find
          </h1>
          <div className="relative h-5 w-[280px] overflow-hidden sm:h-6 sm:w-[320px] md:h-8 md:w-[500px] lg:h-10 lg:w-[700px]">
            <h1
              className={`absolute w-full text-sm transition-transform duration-500 ease-in-out sm:text-lg md:text-2xl lg:text-4xl ${
                member === 'Artists' ? 'translate-y-0' : '-translate-y-full'
              }`}
            >
              your next creative opportunity
            </h1>
            <h1
              className={`absolute w-full text-sm transition-transform duration-500 ease-in-out sm:text-lg md:text-2xl lg:text-4xl ${
                member === 'Artists' ? 'translate-y-full' : 'translate-y-0'
              }`}
            >
              unique talent for your productions
            </h1>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="mt-3 flex w-full items-center justify-center rounded-full bg-darkGrey p-1.5 sm:mt-4 sm:p-2 md:mt-8 md:w-fit md:justify-center">
        <button
          onClick={() => handleClick('Artists')}
          className={`transition-bg mx-0.5 flex-1 rounded-full px-2 py-1 duration-300 sm:mx-1 sm:px-3 sm:py-1.5 md:flex-none ${
            member === 'Artists' ? 'bg-mint' : 'bg-transparent'
          }`}
        >
          <h2 className="text-sm font-bold text-white sm:text-base md:my-2 md:text-3xl">
            Artists
          </h2>
        </button>
        <button
          onClick={() => handleClick('Theatres')}
          className={`transition-bg mx-0.5 flex-1 rounded-full px-2 py-1 duration-300 sm:mx-1 sm:px-3 sm:py-1.5 md:flex-none ${
            member === 'Theatres' ? 'bg-mint' : 'bg-transparent'
          }`}
        >
          <h2 className="text-sm font-bold text-white sm:text-base md:my-2 md:text-3xl">
            Theatres
          </h2>
        </button>
      </div>

      {/* Values */}
      <div className="my-3 sm:my-4 md:my-8">
        <div className="grid w-full max-w-[320px] grid-cols-3 grid-rows-2 items-center gap-1 sm:w-[350px] sm:max-w-none sm:gap-[2px] md:w-[700px] md:gap-3 lg:w-[800px]">
          {Object.keys(values).map((key) => {
            const value = values[Number(key)];
            const currentItem = value[member];
            const className = `relative ${currentItem.col} order-${currentItem.order} ${currentItem.animation} h-[120px] sm:h-[140px] md:h-[200px] lg:h-[220px] transition-transform duration-1000`;
            const isFlipped = flipped[Number(key) - 1];
            return (
              <div
                key={key}
                className={className}
                onClick={() => handleFlip(key)}
                style={{
                  perspective: '600px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div
                  className={`absolute ${currentItem.color} flex h-full w-full items-center justify-center rounded-lg p-2 transition-transform duration-1000 sm:rounded-xl sm:p-3 md:rounded-3xl`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="absolute right-1 top-1 text-xs sm:text-sm md:right-2 md:top-2 md:text-xl">
                    <FontAwesomeIcon icon={faRetweet} className="text-white" />
                  </div>
                  <h1
                    className={`p-1 font-bold text-white ${currentItem.smallFont} ${currentItem.bigFont} mt-2 sm:mt-3 sm:p-2 md:mt-4`}
                  >
                    {currentItem.prop}
                  </h1>
                </div>
                <div
                  className={`absolute ${currentItem.backColor} flex h-full w-full items-center justify-center rounded-lg transition-transform duration-1000 sm:rounded-xl md:rounded-3xl`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)'
                  }}
                >
                  <div className="absolute right-1 top-1 text-xs sm:text-sm md:right-2 md:top-2 md:text-xl">
                    <FontAwesomeIcon icon={faRetweet} className="text-white" />
                  </div>
                  <h2 className="px-1 text-xs font-bold text-white sm:px-2 sm:text-xs md:mx-4 md:mt-4 md:text-lg/5">
                    {currentItem.description}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Values;
