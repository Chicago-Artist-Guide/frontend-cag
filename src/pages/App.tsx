import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  query,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import ManageProduction from '../components/Profile/Company/Production/Manage/ManageProduction';
import ScrollToTop from '../components/ScrollToTop';
import SignUp2 from '../components/SignUp/Individual/SignUp2';
import { AuthProvider } from '../context/AuthContext';
import { FirebaseContext } from '../context/FirebaseContext';
import { Document, ProfileContext } from '../context/ProfileContext';
import '../styles/App.scss';
import GlobalStyle from '../theme/globalStyles';
import Donate from './Donate';
import FAQ from './FAQ';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import NotFound from './NotFound';
import Profile from './Profile';
import SignUp from './SignUp';
import TheaterResources from './TheaterResources';
import TOS from './TOS';
import WhoWeAre from './WhoWeAre';

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
      <Route component={WhoWeAre} exact path="/about-us" />
      <Route component={Login} exact path="/login" />
      <Route component={Logout} exact path="/logout" />
      <Route component={Profile} exact path="/profile" />
      <Route component={SignUp} exact path="/sign-up" />
      <Route component={SignUp2} exact path="/sign-up-2" />
      <Route component={TheaterResources} exact path="/theater-resources" />
      <Route
        component={ManageProduction}
        path="/production/:productionId/manage"
      />
      <Route component={NotFound} />
    </Switch>
    <Footer />
  </Router>
);

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Document>({
    ref: null,
    data: null
  });
  const [profile, setProfile] = useState<Document>({
    ref: null,
    data: null
  });
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    onAuthStateChanged(auth, user => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (!currentUser || !firestore) {
      return;
    }
    queryAccountAndProfile();
  }, [currentUser, firestore]);

  const queryAccountAndProfile = async () => {
    if (!profile?.ref || !account?.ref) {
      const accountQuery = query(
        collection(firestore, 'accounts'),
        where('uid', '==', currentUser?.uid),
        limit(1)
      );
      const queryAccountSnapshot = await getDocs(accountQuery);

      const profileQuery = query(
        collection(firestore, 'profiles'),
        where('uid', '==', currentUser?.uid),
        limit(1)
      );
      const queryProfileSnapshot = await getDocs(profileQuery);

      // Since we are basing this on the current user, we should only be
      // expecting to see one result. If it is possible for more than one then
      // this would need to be adjusted.
      if (!queryAccountSnapshot.empty) {
        // Since this is not empty, we know there is at least one result and
        // therefore we grab the first array item
        setAccount({
          ref: queryAccountSnapshot.docs[0].ref,
          data: queryAccountSnapshot.docs[0].data()
        });
      }

      if (!queryProfileSnapshot.empty) {
        setProfile({
          ref: queryProfileSnapshot.docs[0].ref,
          data: queryProfileSnapshot.docs[0].data()
        });
      }
    }
  };

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
          value={{
            account: account,
            setAccountRef: ref => setAccount(prev => ({ ...prev, ref: ref })),
            setAccountData: data =>
              setAccount(prev => ({ ...prev, data: data })),
            profile: profile,
            setProfileRef: ref => setProfile(prev => ({ ...prev, ref: ref })),
            setProfileData: data =>
              setProfile(prev => ({ ...prev, data: data }))
          }}
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
