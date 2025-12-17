// Supporter/Sponsor images
import Driehaus from '../images/supporters/driehaus.svg';
import Gios from '../images/supporters/gios.png';
import PFM from '../images/supporters/pfm.png';
import WestLoopSoul from '../images/sponsors/west-loop-soul.png';

export interface Supporter {
  src: string;
  alt: string;
  url: string;
}

/**
 * Centralized list of supporters/sponsors for the "Supported By" section
 * This is the single source of truth for all supporter data
 */
export const supporters: Supporter[] = [
  {
    src: Driehaus,
    alt: 'Driehaus Foundation',
    url: 'https://www.driehausfoundation.org/'
  },
  {
    src: WestLoopSoul,
    alt: 'West Loop Soul',
    url: 'https://westloopsoul.com/'
  },
  {
    src: PFM,
    alt: 'PFM',
    url: 'https://www.pfm.com/'
  },
  {
    src: Gios,
    alt: "Gio's BBQ Bar and Grill",
    url: 'https://giosbbqbarandgrill.com/'
  }
];
