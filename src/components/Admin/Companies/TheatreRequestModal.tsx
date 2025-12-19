/**
 * TheatreRequestModal - Review and process a theatre sign-up request
 *
 * Allows approving (creates company account) or rejecting (deletes request).
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCheck,
  faTrash,
  faExternalLinkAlt,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { colors } from '../../../theme/styleVars';
import { TheatreRequest } from '../../../hooks/useCompanies';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { generateTempPassword } from '../../../utils/generateTempPassword';
import AdminButton from '../shared/AdminButton';

interface TheatreRequestModalProps {
  request: TheatreRequest;
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

const Section = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: ${colors.slate};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.5rem;
`;

const Label = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.grayishBlue};
`;

const Value = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: ${colors.slate};
  word-break: break-word;

  a {
    color: ${colors.mint};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${colors.cornflower}20;
  color: ${colors.cornflower};
  margin-right: 0.5rem;
`;

const AdditionalInfo = styled.div`
  background: ${colors.bodyBg};
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
  color: ${colors.slate};
  white-space: pre-wrap;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.lightGrey};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
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

const Note = styled.p`
  font-size: 0.875rem;
  color: ${colors.grayishBlue};
  margin-top: 1rem;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  background: ${colors.salmon}20;
  color: ${colors.salmon};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
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

const TheatreRequestModal: React.FC<TheatreRequestModalProps> = ({
  request,
  onClose,
  onSuccess
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { logAction } = useAdminActions();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Approve request - create company account
  const handleApprove = async () => {
    if (!firebaseFirestore) return;

    setProcessing(true);
    setError(null);

    const tempPassword = generateTempPassword();
    let secondaryApp = null;

    try {
      // Create a secondary Firebase app instance
      // Use unique name to prevent collision if modal is reopened quickly
      secondaryApp = initializeApp(
        firebaseConfig,
        `SecondaryApp_${Date.now()}`
      );
      const secondaryAuth = getAuth(secondaryApp);

      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        request.contactEmail,
        tempPassword
      );

      const userId = userCredential.user.uid;

      // Create account document
      const accountRef = await addDoc(
        collection(firebaseFirestore, 'accounts'),
        {
          uid: userId,
          type: 'company',
          email: request.contactEmail,
          theater_name: request.theatreCompanyName,
          privacy_agreement: true,
          createdAt: serverTimestamp(),
          approved_from_request: true
        }
      );

      // Create profile document
      await addDoc(collection(firebaseFirestore, 'profiles'), {
        uid: userId,
        account_id: accountRef.id,
        theatre_name: request.theatreCompanyName,
        primary_contact: request.contactPerson,
        primary_contact_email: request.contactEmail,
        website: request.theatreWebsite,
        equity_status: request.companyType,
        business_type: request.businessType,
        complete_profile: false
      });

      // Delete the request
      await deleteDoc(doc(firebaseFirestore, 'theatre_requests', request.id));

      // Log the action
      logAction({
        action_type: 'company_approve',
        target_type: 'company',
        target_id: accountRef.id,
        target_name: request.theatreCompanyName,
        details: { request_id: request.id }
      });

      setCredentials({
        email: request.contactEmail,
        password: tempPassword
      });
      setApproved(true);
    } catch (err: any) {
      console.error('Error approving request:', err);

      if (err.code === 'auth/email-already-in-use') {
        setError(
          'This email address is already registered. The company may already have an account.'
        );
      } else {
        setError('Failed to create company account. Please try again.');
      }
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (e) {
          console.warn('Failed to delete secondary app:', e);
        }
      }
      setProcessing(false);
    }
  };

  // Reject request - delete it
  const handleReject = async () => {
    if (!firebaseFirestore) return;

    if (
      !window.confirm(
        'Are you sure you want to reject this request? This action cannot be undone.'
      )
    ) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await deleteDoc(doc(firebaseFirestore, 'theatre_requests', request.id));

      logAction({
        action_type: 'company_reject',
        target_type: 'theatre_request',
        target_id: request.id,
        target_name: request.theatreCompanyName
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request. Please try again.');
      setProcessing(false);
    }
  };

  // Copy credentials to clipboard
  const handleCopy = async () => {
    if (!credentials) return;

    const text = `Chicago Artist Guide - Theatre Company Login Credentials

Company: ${request.theatreCompanyName}
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
    if (e.target === e.currentTarget && !processing) {
      if (approved) {
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
          <h2>{approved ? 'Request Approved!' : 'Review Request'}</h2>
          <CloseButton
            onClick={approved ? onSuccess : onClose}
            disabled={processing}
          >
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </Header>

        <Body>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {approved && credentials ? (
            <SuccessBox>
              <SuccessTitle>Company Account Created!</SuccessTitle>
              <p>
                Share these login credentials with {request.theatreCompanyName}:
              </p>

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
                their profile.
              </Note>
            </SuccessBox>
          ) : (
            <>
              <Section>
                <SectionTitle>Company Information</SectionTitle>
                <InfoGrid>
                  <Label>Company Name:</Label>
                  <Value>{request.theatreCompanyName}</Value>

                  <Label>Website:</Label>
                  <Value>
                    {request.theatreWebsite ? (
                      <a
                        href={request.theatreWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {request.theatreWebsite}{' '}
                        <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </Value>

                  <Label>Type:</Label>
                  <Value>
                    <Badge>{request.companyType}</Badge>
                    <Badge>{request.businessType}</Badge>
                  </Value>
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>Contact Information</SectionTitle>
                <InfoGrid>
                  <Label>Contact Person:</Label>
                  <Value>{request.contactPerson}</Value>

                  <Label>Email:</Label>
                  <Value>{request.contactEmail}</Value>
                </InfoGrid>
              </Section>

              {request.additionalInfo && (
                <Section>
                  <SectionTitle>Additional Information</SectionTitle>
                  <AdditionalInfo>{request.additionalInfo}</AdditionalInfo>
                </Section>
              )}
            </>
          )}
        </Body>

        <Footer>
          {approved ? (
            <AdminButton variant="primary" onClick={onSuccess}>
              Done
            </AdminButton>
          ) : (
            <>
              <AdminButton
                variant="danger"
                icon={faTrash}
                onClick={handleReject}
                disabled={processing}
              >
                Reject
              </AdminButton>
              <ButtonGroup>
                <AdminButton
                  variant="secondary"
                  onClick={onClose}
                  disabled={processing}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  icon={faCheck}
                  onClick={handleApprove}
                  loading={processing}
                  disabled={processing}
                >
                  Approve
                </AdminButton>
              </ButtonGroup>
            </>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default TheatreRequestModal;
