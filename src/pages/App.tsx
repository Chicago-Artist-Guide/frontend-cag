import React from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import Home from './Home';
import Donate from './Donate';
import FAQ from './FAQ';
import NotFound from './NotFound';
import TOS from './TOS';
import WhoWeAre from './WhoWeAre';
import Login from './Login';
import Logout from './Logout';
import Profile from './Profile';
import SignUp from './SignUp';
import SignUp2 from './SignUp2';
import TheaterResources from './TheaterResources';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ScrollToTop';
import '../styles/App.scss';
import GlobalStyle from '../theme/globalStyles';

const CAG = () => (
  <Router>
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
      <Route component={Donate} exact path="/donate" />
      <Route component={FAQ} exact path="/faq" />
      <Route component={TOS} exact path="/terms-of-service" />
      <Route component={WhoWeAre} exact path="/who-we-are" />
      <Route component={Login} exact path="/login" />
      <Route component={Logout} exact path="/logout" />
      <Route component={Profile} exact path="/profile" />
      <Route component={SignUp} exact path="/sign-up" />
      <Route component={SignUp2} exact path="/sign-up-2" />
      <Route component={TheaterResources} exact path="/theater-resources" />
      <Route component={NotFound} />
    </Switch>
    <Footer />
  </Router>
);

const App = () => (
  <main id="cag-frontend-app">
    <CAG />
  </main>
);

export default App;
