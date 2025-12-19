/**
 * EventFormModal - Create and edit events
 *
 * Full form for creating new events or editing existing ones.
 * Includes all event fields: name, date, time, location, details, price, image, externalUrl.
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
import { Event } from '../../../types/event';

interface EventFormModalProps {
  event?: Event | null;
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

const StyledInput = styled.input`
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
  name: Yup.string()
    .required('Event name is required')
    .max(200, 'Name must be 200 characters or less'),
  date: Yup.string().required('Event date is required'),
  time: Yup.string().max(50, 'Time must be 50 characters or less'),
  location: Yup.string()
    .required('Location is required')
    .max(200, 'Location must be 200 characters or less'),
  details: Yup.string().max(2000, 'Details must be 2000 characters or less'),
  price: Yup.string().max(100, 'Price must be 100 characters or less'),
  image: Yup.string().url('Must be a valid URL'),
  externalUrl: Yup.string().url('Must be a valid URL'),
  status: Yup.string().oneOf(
    ['published', 'draft', 'cancelled'],
    'Invalid status'
  )
});

interface FormValues {
  name: string;
  date: string;
  time: string;
  location: string;
  details: string;
  price: string;
  image: string;
  externalUrl: string;
  status: 'published' | 'draft' | 'cancelled';
}

const EventFormModal: React.FC<EventFormModalProps> = ({
  event,
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

  const isEditing = !!event;

  const initialValues: FormValues = {
    name: event?.name || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    details: event?.details || '',
    price: event?.price || '',
    image: event?.image || '',
    externalUrl: event?.externalUrl || '',
    status: event?.status || 'published'
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

      if (isEditing && event) {
        // Update existing event
        const eventRef = doc(firebaseFirestore, 'events', event.id);

        const updateData: {
          [key: string]: string | boolean | FieldValue | null;
        } = {
          name: values.name.trim(),
          date: values.date.trim(),
          time: values.time.trim() || null,
          location: values.location.trim(),
          details: values.details.trim() || null,
          price: values.price.trim() || null,
          image: values.image.trim() || null,
          externalUrl: values.externalUrl.trim() || null,
          status: values.status,
          updatedAt: serverTimestamp(),
          moderated: true,
          moderatedBy: currentUser.uid,
          moderatedAt: serverTimestamp()
        };

        await updateDoc(eventRef, updateData);

        await logAction({
          action_type: 'event_edit',
          target_type: 'event',
          target_id: event.id,
          target_name: values.name,
          changes: {
            before: {
              name: event.name,
              date: event.date,
              status: event.status
            },
            after: {
              name: values.name,
              date: values.date,
              status: values.status
            },
            fields_changed: Object.keys(values)
          },
          notes: `Updated event: ${values.name}`
        });
      } else {
        // Create new event
        const newEvent = {
          name: values.name.trim(),
          date: values.date.trim(),
          time: values.time.trim() || null,
          location: values.location.trim(),
          details: values.details.trim() || null,
          price: values.price.trim() || null,
          image: values.image.trim() || null,
          externalUrl: values.externalUrl.trim() || null,
          status: values.status,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          moderated: true,
          moderatedBy: currentUser.uid,
          moderatedAt: serverTimestamp()
        };

        const docRef = await addDoc(
          collection(firebaseFirestore, 'events'),
          newEvent
        );

        await logAction({
          action_type: 'event_create',
          target_type: 'event',
          target_id: docRef.id,
          target_name: values.name,
          changes: {
            before: {},
            after: { ...newEvent, createdAt: 'serverTimestamp' },
            fields_changed: Object.keys(newEvent)
          },
          notes: `Created new event: ${values.name}`
        });
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('[EventFormModal] Error saving event:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setFormError(errorMessage || 'Failed to save event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!firebaseFirestore || !currentUser || !event) {
      setFormError('Authentication error. Please try again.');
      return;
    }

    try {
      setIsDeleting(true);
      setFormError(null);

      const eventRef = doc(firebaseFirestore, 'events', event.id);
      await deleteDoc(eventRef);

      await logAction({
        action_type: 'event_delete',
        target_type: 'event',
        target_id: event.id,
        target_name: event.name,
        changes: {
          before: {
            name: event.name,
            date: event.date,
            location: event.location,
            status: event.status
          },
          after: {},
          fields_changed: ['deleted']
        },
        notes: `Deleted event: ${event.name}`
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('[EventFormModal] Error deleting event:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setFormError(errorMessage || 'Failed to delete event. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Header>

        <Content>
          {showDeleteConfirm && event && (
            <DeleteConfirmation ref={deleteConfirmRef}>
              <p>
                Are you sure you want to delete &quot;{event.name}&quot;? This
                action cannot be undone.
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
                  <Label htmlFor="name">Event Name *</Label>
                  <Field
                    as={StyledInput}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="e.g., A Night at the CAG-Baret"
                  />
                  <ErrorMessage name="name" component={ErrorText} />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="date">Date *</Label>
                    <Field
                      as={StyledInput}
                      type="text"
                      name="date"
                      id="date"
                      placeholder="e.g., March 15, 2025"
                    />
                    <ErrorMessage name="date" component={ErrorText} />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="time">Time</Label>
                    <Field
                      as={StyledInput}
                      type="text"
                      name="time"
                      id="time"
                      placeholder="e.g., 7:00 PM"
                    />
                    <ErrorMessage name="time" component={ErrorText} />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label htmlFor="location">Location *</Label>
                  <Field
                    as={StyledInput}
                    type="text"
                    name="location"
                    id="location"
                    placeholder="e.g., The Den Theatre, 1331 N Milwaukee Ave"
                  />
                  <ErrorMessage name="location" component={ErrorText} />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="details">Details</Label>
                  <Field
                    as={StyledTextarea}
                    name="details"
                    id="details"
                    placeholder="Describe the event, what attendees can expect..."
                  />
                  <ErrorMessage name="details" component={ErrorText} />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="price">Price</Label>
                    <Field
                      as={StyledInput}
                      type="text"
                      name="price"
                      id="price"
                      placeholder="e.g., $25, Free, $15-$50"
                    />
                    <ErrorMessage name="price" component={ErrorText} />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="status">Status</Label>
                    <Field as={StyledSelect} name="status" id="status">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="cancelled">Cancelled</option>
                    </Field>
                    <ErrorMessage name="status" component={ErrorText} />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label htmlFor="image">Image URL</Label>
                  <Field
                    as={StyledInput}
                    type="url"
                    name="image"
                    id="image"
                    placeholder="https://..."
                  />
                  <ErrorMessage name="image" component={ErrorText} />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="externalUrl">Event Page / Tickets URL</Label>
                  <Field
                    as={StyledInput}
                    type="url"
                    name="externalUrl"
                    id="externalUrl"
                    placeholder="https://..."
                  />
                  <ErrorMessage name="externalUrl" component={ErrorText} />
                </FormGroup>

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
                          : 'Create Event'}
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

export default EventFormModal;
