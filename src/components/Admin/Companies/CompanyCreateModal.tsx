/**
 * CompanyCreateModal - Create a new theatre company account
 *
 * Creates Firebase Auth user and Firestore documents.
 * Uses a secondary Firebase app instance to avoid logging out the admin.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { colors } from '../../../theme/styleVars';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { generateTempPassword } from '../../../utils/generateTempPassword';
import AdminButton from '../shared/AdminButton';

interface CompanyCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

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
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

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

const Body = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.slate};
  margin-bottom: 0.5rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid
    ${(props) => (props.$hasError ? colors.salmon : colors.lightGrey)};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? colors.salmon : colors.mint)};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? `${colors.salmon}20` : `${colors.mint}20`};
  }
`;

const ErrorText = styled.span`
  display: block;
  color: ${colors.salmon};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.lightGrey};
`;

const SuccessBox = styled.div`
  background: ${colors.mint}10;
  border: 2px solid ${colors.mint};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const SuccessTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.mint};
  margin-bottom: 1rem;
`;

const CredentialsBox = styled.div`
  background: ${colors.bodyBg};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.grayishBlue};
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .value {
    font-family: monospace;
    font-size: 1rem;
    color: ${colors.slate};
    word-break: break-all;
  }
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${colors.slate};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.cornflower};
  }
`;

const ErrorMessage = styled.div`
  background: ${colors.salmon}20;
  color: ${colors.salmon};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Note = styled.p`
  font-size: 0.875rem;
  color: ${colors.grayishBlue};
  margin-top: 1rem;
  line-height: 1.5;
`;

// Firebase config from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID
};

const validationSchema = Yup.object({
  theater_name: Yup.string().required('Company name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  primary_contact: Yup.string(),
  primary_contact_email: Yup.string().email('Invalid email address')
});

const CompanyCreateModal: React.FC<CompanyCreateModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { logAction } = useAdminActions();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const formik = useFormik({
    initialValues: {
      theater_name: '',
      email: '',
      primary_contact: '',
      primary_contact_email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!firebaseFirestore) return;

      setCreating(true);
      setError(null);

      const tempPassword = generateTempPassword();
      let secondaryApp = null;

      try {
        // Create a secondary Firebase app instance to avoid logging out the admin
        // Use unique name to prevent collision if modal is reopened quickly
        secondaryApp = initializeApp(
          firebaseConfig,
          `SecondaryApp_${Date.now()}`
        );
        const secondaryAuth = getAuth(secondaryApp);

        // Create the user with the secondary auth instance
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          values.email,
          tempPassword
        );

        const userId = userCredential.user.uid;

        // Create account document
        const accountRef = await addDoc(
          collection(firebaseFirestore, 'accounts'),
          {
            uid: userId,
            type: 'company',
            email: values.email,
            theater_name: values.theater_name,
            privacy_agreement: true,
            createdAt: serverTimestamp(),
            created_by_admin: true
          }
        );

        // Create profile document
        await addDoc(collection(firebaseFirestore, 'profiles'), {
          uid: userId,
          account_id: accountRef.id,
          theatre_name: values.theater_name,
          primary_contact: values.primary_contact || '',
          primary_contact_email: values.primary_contact_email || '',
          complete_profile: false
        });

        // Log the action
        logAction({
          action_type: 'company_create',
          target_type: 'company',
          target_id: accountRef.id,
          target_name: values.theater_name
        });

        // Store credentials to display
        setCredentials({
          email: values.email,
          password: tempPassword
        });

        setSuccess(true);
      } catch (err: any) {
        console.error('Error creating company:', err);

        // Handle specific Firebase auth errors
        if (err.code === 'auth/email-already-in-use') {
          setError(
            'This email address is already registered. Please use a different email.'
          );
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address format.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password is too weak.');
        } else {
          setError('Failed to create company account. Please try again.');
        }
      } finally {
        // Clean up the secondary app
        if (secondaryApp) {
          try {
            await deleteApp(secondaryApp);
          } catch (e) {
            console.warn('Failed to delete secondary app:', e);
          }
        }
        setCreating(false);
      }
    }
  });

  // Copy credentials to clipboard
  const handleCopy = async () => {
    if (!credentials) return;

    const text = `Chicago Artist Guide - Theatre Company Login Credentials

Company: ${formik.values.theater_name}
Email: ${credentials.email}
Temporary Password: ${credentials.password}

Please log in at: ${window.location.origin}/login
We recommend changing your password after your first login.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !creating) {
      if (success) {
        onSuccess();
      } else {
        onClose();
      }
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <h2>{success ? 'Company Created!' : 'Add New Company'}</h2>
          <CloseButton
            onClick={success ? onSuccess : onClose}
            disabled={creating}
          >
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </Header>

        <Body>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {success && credentials ? (
            <SuccessBox>
              <SuccessTitle>Account Created Successfully!</SuccessTitle>
              <p>Share these login credentials with the theatre company:</p>

              <CredentialsBox>
                <div className="label">Email</div>
                <div className="value">{credentials.email}</div>
              </CredentialsBox>

              <CredentialsBox>
                <div className="label">Temporary Password</div>
                <div className="value">{credentials.password}</div>
              </CredentialsBox>

              <CopyButton onClick={handleCopy}>
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? 'Copied!' : 'Copy Credentials'}
              </CopyButton>

              <Note>
                The company can log in at{' '}
                <strong>{window.location.origin}/login</strong> and complete
                their profile. They should change their password after first
                login.
              </Note>
            </SuccessBox>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <FormGroup>
                <Label htmlFor="theater_name">Company Name *</Label>
                <Input
                  id="theater_name"
                  name="theater_name"
                  type="text"
                  value={formik.values.theater_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  $hasError={
                    formik.touched.theater_name && !!formik.errors.theater_name
                  }
                  disabled={creating}
                />
                {formik.touched.theater_name && formik.errors.theater_name && (
                  <ErrorText>{formik.errors.theater_name}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Login Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  $hasError={formik.touched.email && !!formik.errors.email}
                  disabled={creating}
                />
                {formik.touched.email && formik.errors.email && (
                  <ErrorText>{formik.errors.email}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="primary_contact">Primary Contact Name</Label>
                <Input
                  id="primary_contact"
                  name="primary_contact"
                  type="text"
                  value={formik.values.primary_contact}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={creating}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="primary_contact_email">
                  Primary Contact Email
                </Label>
                <Input
                  id="primary_contact_email"
                  name="primary_contact_email"
                  type="email"
                  value={formik.values.primary_contact_email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  $hasError={
                    formik.touched.primary_contact_email &&
                    !!formik.errors.primary_contact_email
                  }
                  disabled={creating}
                />
                {formik.touched.primary_contact_email &&
                  formik.errors.primary_contact_email && (
                    <ErrorText>{formik.errors.primary_contact_email}</ErrorText>
                  )}
              </FormGroup>

              <Note>
                A temporary password will be generated automatically. You'll be
                able to copy the login credentials to share with the company.
              </Note>
            </form>
          )}
        </Body>

        <Footer>
          {success ? (
            <AdminButton variant="primary" onClick={onSuccess}>
              Done
            </AdminButton>
          ) : (
            <>
              <AdminButton
                variant="secondary"
                onClick={onClose}
                disabled={creating}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={() => formik.handleSubmit()}
                loading={creating}
                disabled={creating || !formik.isValid || !formik.dirty}
              >
                Create Company
              </AdminButton>
            </>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CompanyCreateModal;
