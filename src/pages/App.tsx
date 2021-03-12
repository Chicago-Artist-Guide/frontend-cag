import React from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
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
import '../styles/App.scss';
import GlobalStyle from '../theme/globalStyles';

const App = () => (
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
      <Route component={FAQ} exact path="/faq" />
      <Route component={TOS} exact path="/terms-of-service" />
      <Route component={WhoWeAre} exact path="/who-we-are" />
      <Route component={Login} exact path="/login" />
      <Route component={SignUp} exact path="/sign-up" />
      <Route component={NotFound} />
    </Switch>
    <Footer />
  </Router>
);

export default App;
