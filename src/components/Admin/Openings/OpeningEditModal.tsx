/**
 * OpeningEditModal - Edit and moderate openings
 *
 * Allows admins to update opening status, add moderation notes, and edit details.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { colors } from '../../../theme/styleVars';
import { RoleOpportunity } from '../../../types/opening';

interface OpeningEditModalProps {
  opening: RoleOpportunity;
  onClose: () => void;
  onSuccess: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid ${colors.lightGrey};

  h2 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.slate};
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: ${colors.grayishBlue};
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s ease;

    &:hover {
      color: ${colors.slate};
    }
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.slate};
  margin-bottom: 0.5rem;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.mint};
    box-shadow: 0 0 0 3px rgba(130, 178, 154, 0.1);
  }
`;

const Select = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.mint};
    box-shadow: 0 0 0 3px rgba(130, 178, 154, 0.1);
  }
`;

const TextArea = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.mint};
    box-shadow: 0 0 0 3px rgba(130, 178, 154, 0.1);
  }
`;

const ErrorText = styled.div`
  color: ${colors.salmon};
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-family: 'Open Sans', sans-serif;
`;

const FormError = styled.div`
  background: rgba(225, 123, 96, 0.1);
  border: 1px solid ${colors.salmon};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: ${colors.salmon};
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${(props) =>
    props.variant === 'secondary'
      ? `
    background: white;
    color: ${colors.grayishBlue};
    border: 2px solid ${colors.lightGrey};

    &:hover {
      background: ${colors.bodyBg};
    }
  `
      : `
    background: ${colors.mint};
    color: white;

    &:hover {
      background: ${colors.cornflower};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 0.875rem;
  }
`;

const validationSchema = Yup.object({
  status: Yup.string()
    .oneOf(['open', 'closed'], 'Invalid status')
    .required('Status is required'),
  moderationNotes: Yup.string().max(500, 'Notes must be 500 characters or less')
});

const OpeningEditModal: React.FC<OpeningEditModalProps> = ({
  opening,
  onClose,
  onSuccess
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const { logAction } = useAdminActions();
  const [formError, setFormError] = useState<string | null>(null);

  const initialValues = {
    status: opening.status || 'open',
    moderationNotes: opening.moderationNotes || ''
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: any
  ) => {
    if (!firebaseFirestore || !currentUser) {
      setFormError('Authentication error. Please try again.');
      setSubmitting(false);
      return;
    }

    try {
      setFormError(null);

      // Update opening document
      const openingRef = doc(
        firebaseFirestore,
        'roleOpportunities',
        opening.id
      );

      const updateData: any = {
        status: values.status,
        moderated: true,
        moderatedBy: currentUser.uid,
        moderatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (values.moderationNotes.trim()) {
        updateData.moderationNotes = values.moderationNotes.trim();
      }

      await updateDoc(openingRef, updateData);

      // Log admin action
      await logAction({
        action_type: 'opening_moderate',
        target_type: 'opening',
        target_id: opening.id,
        target_name: `${opening.roleName} - ${opening.productionName}`,
        changes: {
          before: { status: opening.status || 'open' },
          after: { status: values.status },
          fields_changed: ['status', 'moderated', 'moderatedBy', 'moderatedAt']
        },
        notes:
          values.moderationNotes || `Updated opening status to ${values.status}`
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('[OpeningEditModal] Error updating opening:', error);
      setFormError(
        error.message || 'Failed to update opening. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Edit Opening</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Header>

        <Content>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form>
                {formError && <FormError>{formError}</FormError>}

                {/* Opening Info (Read-only) */}
                <FormGroup>
                  <Label>Role</Label>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: colors.bodyBg,
                      borderRadius: '8px',
                      fontWeight: 600
                    }}
                  >
                    {opening.roleName}
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Production</Label>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: colors.bodyBg,
                      borderRadius: '8px'
                    }}
                  >
                    {opening.productionName}
                  </div>
                </FormGroup>

                {/* Status (Editable) */}
                <FormGroup>
                  <Label htmlFor="status">Status</Label>
                  <Select as="select" name="status" id="status">
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </Select>
                  <ErrorMessage name="status" component={ErrorText} />
                </FormGroup>

                {/* Moderation Notes (Editable) */}
                <FormGroup>
                  <Label htmlFor="moderationNotes">
                    Moderation Notes (Optional)
                  </Label>
                  <TextArea
                    as="textarea"
                    name="moderationNotes"
                    id="moderationNotes"
                    placeholder="Add any notes about this opening or moderation action..."
                  />
                  <ErrorMessage name="moderationNotes" component={ErrorText} />
                </FormGroup>

                {/* Buttons */}
                <ButtonGroup>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <FontAwesomeIcon icon={faSave} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </ButtonGroup>
              </Form>
            )}
          </Formik>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default OpeningEditModal;
