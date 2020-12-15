import React from 'react';
import '../styles/App.scss';
import Header from '../components/layout/header';
import Footer from '../components/layout/footer';
import Home from './Home';
import FAQ from './FAQ';
import NotFound from './Not-Found';
import TOS from './Terms-of-Service';
import WhoWeAre from './Who-We-Are';
import Login from './Login';
import Signup from './Signup';
import Signup_Individual from './Signup-Company';
import Signup_Company from './Signup-Individual';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
      <Header/>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route exact path="/faq" component={FAQ}/>
        <Route exact path="/terms-of-service" component={TOS}/>
        <Route exact path="/who-we-are" component={WhoWeAre}/>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/sign-up" component={Signup}/>
        <Route exact path="/sign-up/individual" component={Signup_Individual}/>
        <Route exact path="/sign-up/company" component={Signup_Company}/>
        <Route component={NotFound}/>
      </Switch>
      <Footer/>
      </div>
    </Router>
    );
}

export default App;
