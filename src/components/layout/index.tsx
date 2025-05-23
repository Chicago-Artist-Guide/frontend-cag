import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import GlobalStyle from '../../theme/globalStyles';
import { ScrollToTop } from '../shared';
import BlobBox from './BlobBox';
import CardBox from './CardBox';
import Footer from './Footer';
import ForArtists from './ForArtists';
import ForTheatres from './ForTheatres';
import Header from './Header';
import InTouch from './InTouch';
import PageContainer from './PageContainer';
import { Tagline, Title, TitleThree, TitleTwo } from './Titles';

export default function Layout() {
  return (
    <main id="cag-frontend-app">
      <ScrollToTop />
      <GlobalStyle />
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
      <Footer />
    </main>
  );
}

export {
  BlobBox,
  CardBox,
  Footer,
  ForArtists,
  ForTheatres,
  Header,
  InTouch,
  PageContainer,
  Tagline,
  Title,
  TitleThree,
  TitleTwo
};
