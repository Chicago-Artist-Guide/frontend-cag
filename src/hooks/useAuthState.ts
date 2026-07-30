import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const useAuthState = (auth: Auth | null) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) {
      setCurrentUser(null);
      return;
    }

    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isActive) setCurrentUser(user);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [auth]);

  return { currentUser, setCurrentUser };
};

export default useAuthState;
