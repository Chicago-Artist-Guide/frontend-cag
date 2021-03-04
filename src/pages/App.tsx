import React from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import styled from 'styled-components';
import Home from './Home';
import FAQ from './FAQ';
import NotFound from './NotFound';
import TOS from './TOS';
import WhoWeAre from './WhoWeAre';
import Login from './Login';
import SignUp from './SignUp';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { colors, fonts } from '../theme/styleVars';
import '../styles/App.scss';

const App = () => (
  <Router>
    <ScrollToTop />
    <Section>
      <Header />
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Redirect to={{ pathname: '/home' }} />}
        />
        <Route component={Home} exact path="/home" />
        <Route component={FAQ} exact path="/faq" />
        <Route component={TOS} exact path="/terms-of-service" />
        <Route component={WhoWeAre} exact path="/who-we-are" />
        <Route component={Login} exact path="/login" />
        <Route component={SignUp} exact path="/sign-up" />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </Section>
  </Router>
);

const Section = styled.section`
  .orangeText {
    color: ${colors.orange};
    font-weight: bold;
    font-family: ${fonts.lora};
  }

  .nav {
    color: ${colors.mainFont};
    font-size: 12px;
    letter-spacing: 0.84px;
    line-height: 15px;
  }

  .margin-team {
    margin-bottom: 50px;
    margin-top: 50px;
  }

  h1 {
    font-weight: 700;
    font-size: 48px;
    line-height: 56px;
    color: ${colors.secondaryFontColor};
  }

  h2 {
    font-weight: 700;
    font-size: 28px;
    line-height: 36px;
    color: ${colors.mainFont};
  }

  h3 {
    font-weight: 500;
    font-size: 24px;
    line-height: 56px;
    color: ${colors.mainFont};
  }

  h4 {
    font-family: ${fonts.lora};
    font-weight: 400;
    font-style: italic;
    font-size: 24px;
    line-height: 28px;
    letter-spacing: 0.01em;
    color: ${colors.italicColor};
  }

  h5 {
    font-weight: 500;
    font-size: 18px;
    line-height: 20px;
  }

  h6 {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
  }

  p {
    font-family: ${fonts.mainFont};
    font-weight: 400;
    size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
  }

  .button {
    font-weight: 700;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.1em;
  }

  .caption {
    font-family: ${fonts.mainFont};
    font-size: 12px;
    font-weight: 400;
    line-height: 14px;
    letter-spacing: 0.4px;
  }
`;

export default App;
