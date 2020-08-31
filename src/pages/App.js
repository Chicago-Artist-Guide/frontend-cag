import React from 'react';
import '../styles/App.scss';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Resources from '../pages/Resources';
import Home from '../pages/Home';
import Registration from '../pages/Registration';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
      <Header/>
      <Switch>
        <Route exact path="/" component={ Home } />
        <Route path="/registration" component={ Registration } />
        <Route path="/resources" component={ Resources } />
      </Switch>
      <Footer/>
      </div>
    </Router>
    );
}

export default App;
