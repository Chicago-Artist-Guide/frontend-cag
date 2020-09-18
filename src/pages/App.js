import React from 'react';
import '../styles/App.scss';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Resources from '../pages/landing-section/Resources';
import Home from '../pages/landing-section/Home';
import NotFound from '../pages/NotFound';
import Test from '../pages/Test';
import Registration from '../pages/authentication/Registration';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
      <Header/>
      <Switch>
        <Route exact path="/" component={ Home } />
        <Route path="/resources" component={ Resources } />
        <Route exact path="/registration" component={ Registration } />
        <Route exact path="/test" component={Test} />
        <Route component={NotFound}/>
      </Switch>
      <Footer/>
      </div>
    </Router>
    );
}

export default App;
