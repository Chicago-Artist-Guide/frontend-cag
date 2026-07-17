import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const useAuthState = (auth: Auth | null) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) =>
      setCurrentUser(user)
    );
    return unsubscribe;
  }, [auth]);

  return { currentUser, setCurrentUser };
};

export default useAuthState;
