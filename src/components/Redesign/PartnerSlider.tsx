import React, { useState, useEffect, useRef } from 'react';

interface Partner {
  src: string;
  alt: string;
  url: string;
}

interface PartnerSliderProps {
  partners: Partner[];
  autoSlideInterval?: number;
  itemsPerSlide?: number;
  staticMode?: boolean;
  showCards?: boolean;
}

const PartnerSlider: React.FC<PartnerSliderProps> = ({
  partners,
  autoSlideInterval = 5000,
  itemsPerSlide = 3,
  staticMode = false,
  showCards = true
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredPartner, setHoveredPartner] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Number of items to show per view
  const itemsPerView = isMobile ? 1 : itemsPerSlide;

  // Total number of possible positions (slides)
  const totalSlides = Math.ceil(partners.length / itemsPerView);

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (isHovering || partners.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [
    partners.length,
    totalSlides,
    autoSlideInterval,
    isHovering,
    itemsPerView
  ]);

  const handlePrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? totalSlides - 1 : current - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % totalSlides);
  };

  // Show navigation only if we have more partners than we can display at once
  const showNavigation = partners.length > itemsPerView;

  // Static mode: render a simple grid without carousel
  if (staticMode) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
              onMouseEnter={() => setHoveredPartner(index)}
              onMouseLeave={() => setHoveredPartner(null)}
              style={{ aspectRatio: '16/9', minHeight: '140px', width: '100%' }}
            >
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105"
              >
                <img
                  src={partner.src}
                  alt={partner.alt}
                  className="h-full w-full rounded-xl object-contain p-4"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-7xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={containerRef}
    >
      <div className="relative">
        {/* Main slider area */}
        <div className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * (100 / totalSlides)}%)`,
              width: `${totalSlides * 100}%`
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className="flex justify-center gap-6"
                style={{ width: `${100 / totalSlides}%` }}
              >
                {partners
                  .slice(
                    slideIndex * itemsPerView,
                    slideIndex * itemsPerView + itemsPerView
                  )
                  .map((partner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center"
                      onMouseEnter={() =>
                        setHoveredPartner(slideIndex * itemsPerView + index)
                      }
                      onMouseLeave={() => setHoveredPartner(null)}
                    >
                      {showCards ? (
                        <div
                          className={`rounded-xl bg-white p-6 shadow-sm transition-all duration-300 ${
                            hoveredPartner === slideIndex * itemsPerView + index
                              ? 'scale-105 shadow-lg'
                              : 'hover:shadow-lg'
                          }`}
                          style={{
                            minHeight: '140px',
                            width: '100%',
                            maxWidth: '280px'
                          }}
                        >
                          <a
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-full w-full items-center justify-center"
                          >
                            <img
                              src={partner.src}
                              alt={partner.alt}
                              className="max-h-[150px] w-auto object-contain"
                            />
                          </a>
                        </div>
                      ) : (
                        <a
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex justify-center transition-all duration-300 ${
                            hoveredPartner === slideIndex * itemsPerView + index
                              ? 'scale-105 transform rounded-lg shadow-lg'
                              : ''
                          }`}
                        >
                          <img
                            src={partner.src}
                            alt={partner.alt}
                            className="max-h-[150px] w-auto object-contain p-4"
                          />
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows - show only if we have more partners than can fit */}
        {showNavigation && (
          <>
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button
                onClick={handlePrevious}
                className="hover:bg-gray-100 rounded-full bg-white p-2 shadow-md"
                aria-label="Previous partner"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={handleNext}
                className="hover:bg-gray-100 rounded-full bg-white p-2 shadow-md"
                aria-label="Next partner"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Indicator dots */}
            <div className="mt-4 flex justify-center space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-3 w-3 rounded-full ${
                    index === activeIndex ? 'bg-mint' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PartnerSlider;
