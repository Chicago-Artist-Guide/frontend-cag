import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { FirebaseContext } from '../context/FirebaseContext';
import { ProfileContext } from '../context/ProfileContext';
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

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MID
};

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

const App = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accountRef, setAccountRef] = useState<any>(null);
  const [profileRef, setProfileRef] = useState<any>(null);
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    onAuthStateChanged(auth, user => setCurrentUser(user));
  }, []);

  useEffect(() => {
    // get user account doc if exists
    // get user profile doc if exists
  }, [currentUser]);

  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp: app,
        firebaseAnalytics: analytics,
        firebaseAuth: auth,
        firebaseFirestore: firestore,
        firebaseStorage: storage
      }}
    >
      <AuthProvider value={{ currentUser, setCurrentUser }}>
        <ProfileContext.Provider
          value={{ accountRef, setAccountRef, profileRef, setProfileRef }}
        >
          <main id="cag-frontend-app">
            <CAG />
          </main>
        </ProfileContext.Provider>
      </AuthProvider>
    </FirebaseContext.Provider>
  );
};

export default App;
