import React from 'react';
import { zeffyUrl } from '../../utils/marketing';

export const homeFAQ = {
  about: [
    {
      id: 1,
      question: '',
      answer: [
        "Casting and hiring haven't always celebrated the diversity of our city.",
        <br />,
        <br />,
        "We're here to change that.",
        <br />,
        <br />,
        "Chicago Artist Guide offers more equitable casting and hiring opportunities by removing barriers in connecting Chicago's theatre companies with local artists.",
        <br />,
        <br />,
        'Chicago theatres will be able to use our platform to find artists from the communities that their productions represent and invite them directly to audition/apply, removing barriers in auditioning, casting, and hiring.'
      ]
    }
  ],
  price: [
    {
      id: 2,
      question: '',
      answer: [
        'Yes! All features are currently free on Chicago Artist Guide thanks to our generous donors and sponsors. You can support our work ',
        <a href={zeffyUrl} target="_blank">
          here.
        </a>
      ]
    }
  ],
  profile: [
    {
      id: 3,
      question: '',
      answer:
        'Any artist who is 18+ and wants to work in Chicago theatre is welcome to create a profile. We support both union and non-union workers as well as onstage and off-stage talent.'
    }
  ],
  jobs: [
    {
      id: 4,
      question: '',
      answer: [
        'Request a registration link through ',
        <a href="/sign-up">this form</a>,
        ' to start posting jobs. Questions? Reach out to Executive Director, ',
        <a href="mailto:anna@chicagoartistguide.org">Anna Schutz</a>,
        '.'
      ]
    }
  ],
  identity: [
    {
      id: 5,
      question: '',
      answer: [
        'If the theatre company puts no identifiers on their posting, then everyone is eligible. There are no options to filter people by the majority identities of “cis” and “straight."',
        <br />,
        <br />,
        'We also encourage producers not to filter roles as “white” unless it is specifically outlined by the playwright. This means, only people in underrepresented groups will have access to roles specifically created for them.'
      ]
    }
  ]
};
