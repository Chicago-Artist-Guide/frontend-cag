import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { addDoc, collection } from 'firebase/firestore';
import { Button } from '../shared';
import { colors, fonts } from '../../theme/styleVars';
import { Production, Role } from '../Profile/Company/types';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useUserContext } from '../../context/UserContext';

interface PublicShowInterestFormProps {
  show: Production;
  role: Role | null;
  theaterName: string;
  onClose: () => void;
}

const PublicShowInterestForm: React.FC<PublicShowInterestFormProps> = ({
  show,
  role,
  theaterName,
  onClose
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    resume: '',
    headshot: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Create interest document in Firestore
      await addDoc(collection(firebaseFirestore, 'public_interests'), {
        production_id: show.production_id,
        production_name: show.production_name,
        theater_name: theaterName,
        role_id: role?.role_id || null,
        role_name: role?.role_name || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        resume: formData.resume,
        headshot: formData.headshot,
        is_authenticated: !!currentUser,
        created_at: new Date(),
        status: 'new'
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting interest form:', error);
      setError(
        'There was an error submitting your interest. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StyledModal show={true} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <ModalTitle>
          {submitted ? 'Interest Submitted!' : 'Express Interest'}
        </ModalTitle>
      </Modal.Header>
      <Modal.Body>
        {submitted ? (
          <SuccessMessage>
            <p>
              Thank you for your interest in {show.production_name} with{' '}
              {theaterName}!
            </p>
            <p>
              {role
                ? `Your interest in the role of "${role.role_name}" has been submitted.`
                : 'Your interest in this production has been submitted.'}
            </p>
            <p>
              The theatre company will review your information and contact you
              if they'd like to proceed.
            </p>
            <p>
              <strong>Want to apply directly to roles?</strong>{' '}
              <a href="/sign-up">Create an account</a> to build your profile and
              apply with one click!
            </p>
            <CloseButton
              onClick={onClose}
              text="Close"
              type="button"
              variant="primary"
            />
          </SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormIntro>
              {role
                ? `You're expressing interest in the role of "${role.role_name}" for ${show.production_name} with ${theaterName}.`
                : `You're expressing interest in ${show.production_name} with ${theaterName}.`}
            </FormIntro>

            <FormGroup>
              <FormLabel>Your Name *</FormLabel>
              <FormControl
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Email Address *</FormLabel>
              <FormControl
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Phone Number</FormLabel>
              <FormControl
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Message to the Theatre Company</FormLabel>
              <FormTextArea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Introduce yourself and explain why you're interested in this production or role"
                rows={4}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Link to Resume (optional)</FormLabel>
              <FormControl
                type="url"
                name="resume"
                value={formData.resume}
                onChange={handleChange}
                placeholder="https://..."
              />
              <FormHint>
                Provide a link to your resume (Google Drive, Dropbox, etc.)
              </FormHint>
            </FormGroup>

            <FormGroup>
              <FormLabel>Link to Headshot (optional)</FormLabel>
              <FormControl
                type="url"
                name="headshot"
                value={formData.headshot}
                onChange={handleChange}
                placeholder="https://..."
              />
              <FormHint>
                Provide a link to your headshot (Google Drive, Dropbox, etc.)
              </FormHint>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <AccountPrompt>
              <strong>Want a faster application process?</strong>{' '}
              <a href="/sign-up">Create an account</a> to build your profile and
              apply with one click!
            </AccountPrompt>

            <ButtonContainer>
              <CancelButton
                onClick={onClose}
                text="Cancel"
                type="button"
                variant="secondary"
              />
              <SubmitButton
                text={submitting ? 'Submitting...' : 'Submit Interest'}
                type="submit"
                variant="primary"
                disabled={submitting}
              />
            </ButtonContainer>
          </Form>
        )}
      </Modal.Body>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 8px;
  }
`;

const ModalTitle = styled(Modal.Title)`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 24px;
`;

const FormIntro = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  margin-bottom: 20px;
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 20px;
`;

const FormLabel = styled(Form.Label)`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const FormControl = styled(Form.Control)`
  font-family: ${fonts.montserrat};
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${colors.lightGrey};

  &:focus {
    border-color: ${colors.mint};
    box-shadow: 0 0 0 0.2rem rgba(130, 178, 154, 0.25);
  }
`;

// Using a simpler approach to avoid TypeScript circular reference error
const FormTextArea = styled.textarea`
  font-family: ${fonts.montserrat};
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${colors.lightGrey};
  width: 100%;

  &:focus {
    border-color: ${colors.mint};
    box-shadow: 0 0 0 0.2rem rgba(130, 178, 154, 0.25);
    outline: none;
  }
`;

const FormHint = styled.small`
  display: block;
  font-family: ${fonts.montserrat};
  font-size: 12px;
  color: ${colors.grayishBlue};
  margin-top: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SubmitButton = styled(Button)`
  min-width: 150px;
`;

const CancelButton = styled(Button)`
  min-width: 100px;
`;

const CloseButton = styled(Button)`
  min-width: 100px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  color: ${colors.salmon};
  font-family: ${fonts.montserrat};
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(255, 99, 71, 0.1);
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  line-height: 1.6;
  text-align: center;

  p {
    margin-bottom: 15px;
  }

  a {
    color: ${colors.mint};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AccountPrompt = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 14px;
  background-color: rgba(130, 178, 154, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;

  a {
    color: ${colors.mint};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default PublicShowInterestForm;
