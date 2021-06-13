import React from 'react';
import { Router } from 'react-router';
import {
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Home from './Home';
import FAQ from './FAQ';
import NotFound from './NotFound';
import TOS from './TOS';
import WhoWeAre from './WhoWeAre';
import Login from './Login';
import Logout from './Logout';
import SignUp from './SignUp';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { SessionContext, getSessionCookie } from '../utils/session';
import '../styles/App.scss';
import GlobalStyle from '../theme/globalStyles';

const history = createBrowserHistory();

const CAG = () => {
  const session = getSessionCookie();

  return (
    <SessionContext.Provider value={session}>
      <Router history={history}>
        <ScrollToTop />
        <GlobalStyle />
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
          <Route component={Logout} exact path="/logout" />
          <Route component={SignUp} exact path="/sign-up" />
          <Route component={NotFound} />
        </Switch>
        <Footer />
      </Router>
    </SessionContext.Provider>
  );
};

const App = () => (
  <main id="cag-frontend-app">
    <CAG />
  </main>
);

export default App;
