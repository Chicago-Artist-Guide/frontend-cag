import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import Home from './Home';
import FAQ from './FAQ';
import NotFound from './NotFound';
import TOS from './TOS';
import WhoWeAre from './WhoWeAre';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../styles/App.scss';

const App = () => (
  <Router>
    <div>
      <Header />
      <Switch>
        <Route component={Home} exact path="/" />
        <Route component={FAQ} exact path="/faq" />
        <Route component={TOS} exact path="/terms-of-service" />
        <Route component={WhoWeAre} exact path="/who-we-are" />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
  </Router>
);

export default App;
