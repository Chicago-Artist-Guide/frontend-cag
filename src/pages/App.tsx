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
    color: ${colors.secondaryFontColor};
    font-size: 48px;
    font-weight: 700;
    line-height: 56px;
  }

  h2 {
    color: ${colors.mainFont};
    font-size: 28px;
    font-weight: 700;
    line-height: 36px;
  }

  h3 {
    color: ${colors.mainFont};
    font-size: 24px;
    font-weight: 500;
    line-height: 56px;
  }

  h4 {
    color: ${colors.italicColor};
    font-family: ${fonts.lora};
    font-size: 24px;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0.01em;
    line-height: 28px;
  }

  h5 {
    font-size: 18px;
    font-weight: 500;
    line-height: 20px;
  }

  h6 {
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
  }

  p {
    font-family: ${fonts.mainFont};
    font-weight: 400;
    letter-spacing: 0.5px;
    line-height: 24px;
    size: 16px;
  }

  .button {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 16px;
  }

  .caption {
    font-family: ${fonts.mainFont};
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.4px;
    line-height: 14px;
  }
`;

export default App;
