import { useUserContext } from '../context/UserContext';
import { STAFF_CONFIG } from '../config/staffAccess';

export const useStaffAuth = () => {
  const { currentUser } = useUserContext();

  const isStaff = !!(
    currentUser?.email &&
    STAFF_CONFIG.emails.includes(currentUser.email.toLowerCase())
  );

  return {
    isStaff,
    staffEmail: currentUser?.email,
    features: isStaff ? STAFF_CONFIG.features : null
  };
};
