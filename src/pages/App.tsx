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
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { colors, fonts } from '../theme/styleVars';
import '../styles/App.scss';

const App = () => (
  <Router>
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
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </Section>
  </Router>
);

const Section = styled.section`
  p {
    font-family: ${fonts.mainFont};
    font-size: 16px;
  }

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
`;

export default App;
