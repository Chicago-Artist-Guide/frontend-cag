/**
 * OpeningFormModal - Create and edit openings
 *
 * Full form for creating new openings or editing existing ones.
 * Includes all opening fields: role name, description, type, pay, location, URLs.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faSave,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  deleteDoc,
  FieldValue
} from 'firebase/firestore';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { colors } from '../../../theme/styleVars';
import { RoleOpportunity } from '../../../types/opening';

interface OpeningFormModalProps {
  opening?: RoleOpportunity | null;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
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

const StyledSelect = styled.select`
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

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  resize: vertical;
  min-height: 120px;
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
  justify-content: space-between;
  margin-top: 2rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
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

  ${(props) => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: white;
          color: ${colors.grayishBlue};
          border: 2px solid ${colors.lightGrey};

          &:hover {
            background: ${colors.bodyBg};
          }
        `;
      case 'danger':
        return `
          background: ${colors.salmon};
          color: white;

          &:hover {
            background: #c9684c;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `;
      default:
        return `
          background: ${colors.mint};
          color: white;

          &:hover {
            background: ${colors.cornflower};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 0.875rem;
  }
`;

const DeleteConfirmation = styled.div`
  background: rgba(225, 123, 96, 0.1);
  border: 1px solid ${colors.salmon};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  p {
    margin: 0 0 1rem 0;
    color: ${colors.slate};
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }
`;

const validationSchema = Yup.object({
  roleName: Yup.string()
    .required('Position title is required')
    .max(100, 'Title must be 100 characters or less'),
  productionName: Yup.string()
    .required('Department/Team is required')
    .max(100, 'Department must be 100 characters or less'),
  description: Yup.string()
    .required('Description is required')
    .max(2000, 'Description must be 2000 characters or less'),
  roleType: Yup.string().required('Position type is required'),
  pay: Yup.string().max(50, 'Pay must be 50 characters or less'),
  location: Yup.string().max(100, 'Location must be 100 characters or less'),
  googleFormUrl: Yup.string().url('Must be a valid URL'),
  moreInfoUrl: Yup.string().url('Must be a valid URL'),
  status: Yup.string().oneOf(['open', 'closed'], 'Invalid status')
});

interface FormValues {
  roleName: string;
  productionName: string;
  description: string;
  roleType: string;
  pay: string;
  location: string;
  googleFormUrl: string;
  moreInfoUrl: string;
  status: 'open' | 'closed';
  ongoing: string; // 'true' or 'false' - HTML select returns strings
}

const OpeningFormModal: React.FC<OpeningFormModalProps> = ({
  opening,
  onClose,
  onSuccess
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const { logAction } = useAdminActions();
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to delete confirmation when it appears
  useEffect(() => {
    if (showDeleteConfirm && deleteConfirmRef.current) {
      deleteConfirmRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [showDeleteConfirm]);

  const isEditing = !!opening;

  const initialValues: FormValues = {
    roleName: opening?.roleName || '',
    productionName: opening?.productionName || 'Chicago Artist Guide',
    description: opening?.description || '',
    roleType: opening?.roleType || 'Staff',
    pay: opening?.pay || '',
    location: opening?.location || 'Chicago',
    googleFormUrl: opening?.googleFormUrl || '',
    moreInfoUrl: opening?.moreInfoUrl || '',
    status: opening?.status || 'open',
    ongoing: opening?.ongoing ? 'true' : 'false'
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    if (!firebaseFirestore || !currentUser) {
      setFormError('Authentication error. Please try again.');
      setSubmitting(false);
      return;
    }

    try {
      setFormError(null);

      if (isEditing && opening) {
        // Update existing opening
        const openingRef = doc(
          firebaseFirestore,
          'roleOpportunities',
          opening.id
        );

        const updateData: {
          [key: string]: string | boolean | FieldValue | null;
        } = {
          roleName: values.roleName.trim(),
          productionName: values.productionName.trim(),
          description: values.description.trim(),
          roleType: values.roleType,
          pay: values.pay.trim() || null,
          location: values.location.trim() || null,
          googleFormUrl: values.googleFormUrl.trim() || null,
          moreInfoUrl: values.moreInfoUrl.trim() || null,
          status: values.status,
          ongoing: values.ongoing === 'true',
          updatedAt: serverTimestamp(),
          moderated: true,
          moderatedBy: currentUser.uid,
          moderatedAt: serverTimestamp()
        };

        await updateDoc(openingRef, updateData);

        await logAction({
          action_type: 'opening_edit',
          target_type: 'opening',
          target_id: opening.id,
          target_name: `${values.roleName} - ${values.productionName}`,
          changes: {
            before: {
              roleName: opening.roleName,
              description: opening.description,
              status: opening.status
            },
            after: {
              roleName: values.roleName,
              description: values.description,
              status: values.status
            },
            fields_changed: Object.keys(values)
          },
          notes: `Updated opening: ${values.roleName}`
        });
      } else {
        // Create new opening
        const newOpening = {
          roleName: values.roleName.trim(),
          productionName: values.productionName.trim(),
          productionId: 'cag',
          description: values.description.trim(),
          roleType: values.roleType,
          pay: values.pay.trim() || null,
          location: values.location.trim() || null,
          googleFormUrl: values.googleFormUrl.trim() || null,
          moreInfoUrl: values.moreInfoUrl.trim() || null,
          status: values.status,
          ongoing: values.ongoing === 'true',
          account_id: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          moderated: true,
          moderatedBy: currentUser.uid,
          moderatedAt: serverTimestamp()
        };

        const docRef = await addDoc(
          collection(firebaseFirestore, 'roleOpportunities'),
          newOpening
        );

        await logAction({
          action_type: 'opening_create',
          target_type: 'opening',
          target_id: docRef.id,
          target_name: `${values.roleName} - ${values.productionName}`,
          changes: {
            before: {},
            after: { ...newOpening, createdAt: 'serverTimestamp' },
            fields_changed: Object.keys(newOpening)
          },
          notes: `Created new opening: ${values.roleName}`
        });
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('[OpeningFormModal] Error saving opening:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setFormError(errorMessage || 'Failed to save opening. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!firebaseFirestore || !currentUser || !opening) {
      setFormError('Authentication error. Please try again.');
      return;
    }

    try {
      setIsDeleting(true);
      setFormError(null);

      const openingRef = doc(
        firebaseFirestore,
        'roleOpportunities',
        opening.id
      );
      await deleteDoc(openingRef);

      await logAction({
        action_type: 'opening_delete',
        target_type: 'opening',
        target_id: opening.id,
        target_name: `${opening.roleName} - ${opening.productionName}`,
        changes: {
          before: {
            roleName: opening.roleName,
            productionName: opening.productionName,
            description: opening.description,
            status: opening.status
          },
          after: {},
          fields_changed: ['deleted']
        },
        notes: `Deleted opening: ${opening.roleName}`
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('[OpeningFormModal] Error deleting opening:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setFormError(
        errorMessage || 'Failed to delete opening. Please try again.'
      );
      setIsDeleting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>{isEditing ? 'Edit Opening' : 'Add New Opening'}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Header>

        <Content>
          {showDeleteConfirm && opening && (
            <DeleteConfirmation ref={deleteConfirmRef}>
              <p>
                Are you sure you want to delete &quot;{opening.roleName}&quot;?
                This action cannot be undone.
              </p>
              <div className="actions">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </DeleteConfirmation>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {formError && <FormError>{formError}</FormError>}

                <FormGroup>
                  <Label htmlFor="roleName">Position Title *</Label>
                  <Input
                    type="text"
                    name="roleName"
                    id="roleName"
                    placeholder="e.g., Project Manager, Grant Writer"
                  />
                  <ErrorMessage name="roleName" component={ErrorText} />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="productionName">Department/Team *</Label>
                    <Input
                      type="text"
                      name="productionName"
                      id="productionName"
                      placeholder="e.g., Chicago Artist Guide"
                    />
                    <ErrorMessage name="productionName" component={ErrorText} />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="roleType">Position Type *</Label>
                    <Field as={StyledSelect} name="roleType" id="roleType">
                      <option value="Staff">Staff</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Board">Board</option>
                      <option value="Intern">Intern</option>
                      <option value="Contract">Contract</option>
                    </Field>
                    <ErrorMessage name="roleType" component={ErrorText} />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label htmlFor="description">Description *</Label>
                  <Field
                    as={StyledTextarea}
                    name="description"
                    id="description"
                    placeholder="Describe the position, responsibilities, and requirements..."
                  />
                  <ErrorMessage name="description" component={ErrorText} />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="pay">Compensation</Label>
                    <Input
                      type="text"
                      name="pay"
                      id="pay"
                      placeholder="e.g., $250, Volunteer, Stipend"
                    />
                    <ErrorMessage name="pay" component={ErrorText} />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      type="text"
                      name="location"
                      id="location"
                      placeholder="e.g., Chicago, Remote"
                    />
                    <ErrorMessage name="location" component={ErrorText} />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label htmlFor="googleFormUrl">Application Form URL</Label>
                  <Input
                    type="url"
                    name="googleFormUrl"
                    id="googleFormUrl"
                    placeholder="https://forms.google.com/..."
                  />
                  <ErrorMessage name="googleFormUrl" component={ErrorText} />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="moreInfoUrl">More Info URL</Label>
                  <Input
                    type="url"
                    name="moreInfoUrl"
                    id="moreInfoUrl"
                    placeholder="https://..."
                  />
                  <ErrorMessage name="moreInfoUrl" component={ErrorText} />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="status">Status</Label>
                    <Field as={StyledSelect} name="status" id="status">
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </Field>
                    <ErrorMessage name="status" component={ErrorText} />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="ongoing">Position Type</Label>
                    <Field as={StyledSelect} name="ongoing" id="ongoing">
                      <option value="false">Temporal (Current Openings)</option>
                      <option value="true">Ongoing (Always Open)</option>
                    </Field>
                  </FormGroup>
                </FormRow>

                <ButtonGroup>
                  <div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSubmitting || showDeleteConfirm}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </Button>
                    )}
                  </div>
                  <ButtonRow>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <FontAwesomeIcon icon={isEditing ? faSave : faPlus} />
                      {isSubmitting
                        ? 'Saving...'
                        : isEditing
                          ? 'Save Changes'
                          : 'Create Opening'}
                    </Button>
                  </ButtonRow>
                </ButtonGroup>
              </Form>
            )}
          </Formik>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default OpeningFormModal;
