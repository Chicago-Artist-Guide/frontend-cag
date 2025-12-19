/**
 * UserEditModal - Edit user information and roles
 *
 * Formik-based modal for editing user details. Super admins can assign roles.
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import {
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { colors } from '../../../theme/styleVars';
import { CombinedUserData, UserEditFormData } from '../../../types/user';
import { AdminRole } from '../../../types/admin';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import AdminButton from '../shared/AdminButton';

interface UserEditModalProps {
  user: CombinedUserData;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal overlay
 */
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 2rem;
`;

/**
 * Modal container
 */
const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

/**
 * Modal header
 */
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  border-bottom: 1px solid ${colors.lightGrey};

  h2 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.slate};
    margin: 0;
  }
`;

/**
 * Close button
 */
const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.grayishBlue};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.bodyBg};
    color: ${colors.slate};
  }

  svg {
    font-size: 1.25rem;
  }
`;

/**
 * Modal body
 */
const Body = styled.div`
  padding: 2rem;
`;

/**
 * Form group
 */
const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Label
 */
const Label = styled.label`
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.slate};
  margin-bottom: 0.5rem;
`;

/**
 * Input
 */
const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: ${colors.slate};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.mint};
    box-shadow: 0 0 0 3px rgba(130, 178, 154, 0.1);
  }

  &:disabled {
    background: ${colors.bodyBg};
    cursor: not-allowed;
  }
`;

/**
 * Select
 */
const Select = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: ${colors.slate};
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: ${colors.mint};
    box-shadow: 0 0 0 3px rgba(130, 178, 154, 0.1);
  }

  &:disabled {
    background: ${colors.bodyBg};
    color: ${colors.grayishBlue};
    cursor: not-allowed;
  }
`;

/**
 * Textarea
 */
const Textarea = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: ${colors.slate};
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${colors.mint};
    box-shadow: 0 0 0 3px rgba(130, 178, 154, 0.1);
  }
`;

/**
 * Error message
 */
const ErrorMessage = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.75rem;
  color: ${colors.salmon};
  margin-top: 0.25rem;
`;

/**
 * Section divider
 */
const SectionDivider = styled.div`
  border-top: 2px solid ${colors.bodyBg};
  margin: 2rem 0 1.5rem;
  padding-top: 1.5rem;

  h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: ${colors.slate};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }
`;

/**
 * Footer
 */
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.lightGrey};
`;

/**
 * Status message
 */
const StatusMessage = styled.div<{ $type: 'error' | 'success' }>`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: ${(props) => (props.$type === 'error' ? colors.salmon : colors.mint)};
`;

/**
 * Warning message
 */
const WarningMessage = styled.div`
  padding: 1rem;
  background: rgba(225, 123, 96, 0.1);
  border: 1px solid ${colors.salmon};
  border-radius: 8px;
  color: ${colors.slate};
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

/**
 * Validation schema
 */
const getValidationSchema = (accountType: string) => {
  const baseSchema: any = {
    email: Yup.string().email('Invalid email').required('Email is required')
  };

  if (accountType === 'individual') {
    baseSchema.first_name = Yup.string().required('First name is required');
    baseSchema.last_name = Yup.string().required('Last name is required');
  }

  if (accountType === 'company') {
    baseSchema.theater_name = Yup.string().required('Theater name is required');
  }

  return Yup.object(baseSchema);
};

/**
 * UserEditModal Component
 */
const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  onClose,
  onSuccess
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const { adminRole } = useAdminAuth();
  const { logAction } = useAdminActions();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  const isSuperAdmin = adminRole === 'super_admin';
  const isEditingSelf = currentUser?.uid === user.uid;

  console.log('[UserEditModal] User data:', {
    uid: user.uid,
    admin_role: user.admin_role,
    email: user.email
  });

  // Initial form values
  const initialValues: UserEditFormData = {
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    preferred_name: user.preferred_name || '',
    theater_name: user.theater_name || '',
    admin_role: user.admin_role || ('' as any), // Convert null to empty string for select
    admin_role_notes: user.admin_role_notes || ''
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = async (
    values: UserEditFormData,
    { setSubmitting }: any
  ) => {
    if (!firebaseFirestore || !currentUser) {
      setStatusMessage({ type: 'error', text: 'Firestore not initialized' });
      setSubmitting(false);
      return;
    }

    try {
      setStatusMessage(null);

      // Track changes for audit log
      const changes: any = {
        before: {},
        after: {},
        fields_changed: []
      };

      // Update account document
      const accountRef = doc(firebaseFirestore, 'accounts', user.accountId);
      const accountUpdates: any = {
        email: values.email
      };

      // Track email change
      if (user.email !== values.email) {
        changes.before.email = user.email;
        changes.after.email = values.email;
        changes.fields_changed.push('email');
      }

      // Handle admin role changes (super_admin only, cannot change own role)
      // Normalize empty string to null for comparison
      const newRole = values.admin_role || null;
      const oldRole = user.admin_role || null;
      const adminRoleChanged =
        isSuperAdmin && !isEditingSelf && newRole !== oldRole;

      console.log('[UserEditModal] Role check:', {
        'values.admin_role': values.admin_role,
        newRole,
        oldRole,
        isSuperAdmin,
        isEditingSelf,
        adminRoleChanged
      });

      if (adminRoleChanged) {
        accountUpdates.admin_role = newRole;
        accountUpdates.admin_role_assigned_at = serverTimestamp();
        accountUpdates.admin_role_assigned_by = currentUser.email;
        accountUpdates.admin_role_notes = values.admin_role_notes || '';
        accountUpdates.admin_active = true;

        changes.before.admin_role = user.admin_role;
        changes.after.admin_role = values.admin_role;
        changes.fields_changed.push('admin_role');

        // Sync admin_users collection (required for Firestore rules enforcement)
        // Document ID must be the user's auth UID for direct lookup in rules
        const adminUserRef = doc(firebaseFirestore, 'admin_users', user.uid);
        console.log('[UserEditModal] Syncing admin_users for uid:', user.uid);
        console.log('[UserEditModal] Setting role to:', newRole);

        if (newRole) {
          // Create or update admin_users document
          try {
            await setDoc(adminUserRef, {
              role: newRole,
              email: values.email || user.email,
              assigned_at: serverTimestamp(),
              assigned_by: currentUser.email
            });
            console.log('[UserEditModal] ✅ admin_users doc created/updated');
          } catch (adminUserError: any) {
            console.error(
              '[UserEditModal] ❌ Failed to sync admin_users:',
              adminUserError
            );
            throw adminUserError; // Re-throw to trigger error handling
          }
        } else {
          // Remove admin_users document if role is cleared
          await deleteDoc(adminUserRef);
          console.log('[UserEditModal] admin_users doc deleted');
        }
      }

      if (user.type === 'company') {
        accountUpdates.theater_name = values.theater_name;
        if (user.theater_name !== values.theater_name) {
          changes.before.theater_name = user.theater_name;
          changes.after.theater_name = values.theater_name;
          changes.fields_changed.push('theater_name');
        }
      }

      await updateDoc(accountRef, accountUpdates);

      // Update profile document (for individuals)
      if (user.type === 'individual' && user.profile_exists) {
        const profilesRef = collection(firebaseFirestore, 'profiles');
        const profileQuery = query(
          profilesRef,
          where('uid', '==', user.uid),
          limit(1)
        );
        const profileSnapshot = await getDocs(profileQuery);

        if (!profileSnapshot.empty) {
          const profileDoc = profileSnapshot.docs[0];
          const profileUpdates: any = {
            first_name: values.first_name,
            last_name: values.last_name,
            preferred_name: values.preferred_name || ''
          };

          if (user.first_name !== values.first_name) {
            changes.before.first_name = user.first_name;
            changes.after.first_name = values.first_name;
            changes.fields_changed.push('first_name');
          }
          if (user.last_name !== values.last_name) {
            changes.before.last_name = user.last_name;
            changes.after.last_name = values.last_name;
            changes.fields_changed.push('last_name');
          }

          await updateDoc(
            doc(firebaseFirestore, 'profiles', profileDoc.id),
            profileUpdates
          );
        }
      }

      // Log the action
      await logAction({
        action_type: changes.fields_changed.includes('admin_role')
          ? 'role_change'
          : 'user_edit',
        target_type: 'user',
        target_id: user.uid,
        target_name: user.email || user.theater_name || 'Unknown',
        changes,
        notes: values.admin_role_notes || undefined
      });

      setStatusMessage({ type: 'success', text: 'User updated successfully!' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('[UserEditModal] Error updating user:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update user'
      });
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <h2>Edit User</h2>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </Header>

        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema(user.type)}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <Body>
                {/* Basic Information */}
                <FormGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="user@example.com"
                  />
                  {errors.email && touched.email && (
                    <ErrorMessage>{errors.email}</ErrorMessage>
                  )}
                </FormGroup>

                {/* Individual fields */}
                {user.type === 'individual' && (
                  <>
                    <FormGroup>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder="First name"
                      />
                      {errors.first_name && touched.first_name && (
                        <ErrorMessage>{errors.first_name}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        type="text"
                        name="last_name"
                        id="last_name"
                        placeholder="Last name"
                      />
                      {errors.last_name && touched.last_name && (
                        <ErrorMessage>{errors.last_name}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="preferred_name">
                        Preferred Name (Optional)
                      </Label>
                      <Input
                        type="text"
                        name="preferred_name"
                        id="preferred_name"
                        placeholder="Preferred name"
                      />
                    </FormGroup>
                  </>
                )}

                {/* Company fields */}
                {user.type === 'company' && (
                  <FormGroup>
                    <Label htmlFor="theater_name">Theater Name</Label>
                    <Input
                      type="text"
                      name="theater_name"
                      id="theater_name"
                      placeholder="Theater company name"
                    />
                    {errors.theater_name && touched.theater_name && (
                      <ErrorMessage>{errors.theater_name}</ErrorMessage>
                    )}
                  </FormGroup>
                )}

                {/* Admin Role (super_admin only) */}
                {isSuperAdmin && (
                  <SectionDivider>
                    <h3>Admin Permissions</h3>

                    {isEditingSelf && (
                      <WarningMessage>
                        <strong>Note:</strong> You cannot change your own admin
                        role. To modify your role, another Super Admin must make
                        the change.
                      </WarningMessage>
                    )}

                    <FormGroup>
                      <Label htmlFor="admin_role">Admin Role</Label>
                      <select
                        name="admin_role"
                        id="admin_role"
                        disabled={isEditingSelf}
                        value={values.admin_role || ''}
                        onChange={(e) => {
                          console.log(
                            '[UserEditModal] Role dropdown changed to:',
                            e.target.value
                          );
                          setFieldValue('admin_role', e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #E5E5E5',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          backgroundColor: isEditingSelf ? '#F8F9FA' : 'white',
                          color: isEditingSelf ? '#6B7B8A' : '#2D3748',
                          cursor: isEditingSelf ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <option value="">No admin role</option>
                        <option value="staff">Staff (View only)</option>
                        <option value="moderator">
                          Moderator (Moderate content)
                        </option>
                        <option value="admin">
                          Admin (Manage users & companies)
                        </option>
                        <option value="super_admin">
                          Super Admin (Full access)
                        </option>
                      </select>
                    </FormGroup>

                    {!isEditingSelf && (
                      <FormGroup>
                        <Label htmlFor="admin_role_notes">
                          Role Assignment Notes (Optional)
                        </Label>
                        <Textarea
                          as="textarea"
                          name="admin_role_notes"
                          id="admin_role_notes"
                          placeholder="Why is this user being assigned this role?"
                        />
                      </FormGroup>
                    )}
                  </SectionDivider>
                )}
              </Body>

              <Footer>
                <div>
                  {statusMessage && (
                    <StatusMessage $type={statusMessage.type}>
                      {statusMessage.text}
                    </StatusMessage>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon
                      icon={faSave}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </AdminButton>
                </div>
              </Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Overlay>
  );
};

export default UserEditModal;
