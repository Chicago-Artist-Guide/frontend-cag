/**
 * CompanyEditModal - Edit company information
 *
 * Allows editing company account and profile data.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { colors } from '../../../theme/styleVars';
import { CompanyData } from '../../../hooks/useCompanies';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import AdminButton from '../shared/AdminButton';

interface CompanyEditModalProps {
  company: CompanyData;
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

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid
    ${(props) => (props.$hasError ? colors.salmon : colors.lightGrey)};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: 'Open Sans', sans-serif;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? colors.salmon : colors.mint)};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? `${colors.salmon}20` : `${colors.mint}20`};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid
    ${(props) => (props.$hasError ? colors.salmon : colors.lightGrey)};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;

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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    font-size: 0.875rem;
    color: ${colors.slate};
    cursor: pointer;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.lightGrey};
`;

const SuccessMessage = styled.div`
  background: ${colors.mint}20;
  color: ${colors.mint};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  background: ${colors.salmon}20;
  color: ${colors.salmon};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const validationSchema = Yup.object({
  theater_name: Yup.string().required('Company name is required'),
  email: Yup.string().email('Invalid email address'),
  primary_contact: Yup.string(),
  primary_contact_email: Yup.string().email('Invalid email address'),
  location: Yup.string(),
  website: Yup.string().url('Must be a valid URL'),
  description: Yup.string()
});

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  company,
  onClose,
  onSuccess
}) => {
  const { firebaseFirestore } = useFirebaseContext();
  const { logAction } = useAdminActions();
  const { hasPermission } = useAdminAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canDelete = hasPermission('companies', 'delete');

  const formik = useFormik({
    initialValues: {
      theater_name: company.theater_name || '',
      email: company.email || '',
      primary_contact: company.primary_contact || '',
      primary_contact_email: company.primary_contact_email || '',
      location: company.location || '',
      website: company.website || '',
      description: company.description || '',
      number_of_members: company.number_of_members || '',
      disabled: company.disabled || false
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!firebaseFirestore) return;

      setSaving(true);
      setError(null);

      try {
        // Update account document
        const accountRef = doc(
          firebaseFirestore,
          'accounts',
          company.accountId
        );
        await updateDoc(accountRef, {
          theater_name: values.theater_name,
          email: values.email,
          disabled: values.disabled,
          updated_at: serverTimestamp()
        });

        // Update profile document if it exists
        if (company.profileId) {
          const profileRef = doc(
            firebaseFirestore,
            'profiles',
            company.profileId
          );
          await updateDoc(profileRef, {
            theatre_name: values.theater_name,
            primary_contact: values.primary_contact,
            primary_contact_email: values.primary_contact_email,
            location: values.location,
            website: values.website,
            description: values.description,
            number_of_members: values.number_of_members,
            updated_at: serverTimestamp()
          });
        }

        // Log the action
        logAction({
          action_type: 'company_edit',
          target_type: 'company',
          target_id: company.accountId,
          target_name: values.theater_name,
          details: { disabled: values.disabled }
        });

        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } catch (err: any) {
        console.error('Error updating company:', err);
        setError('Failed to update company. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  });

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <h2>Edit Company</h2>
          <CloseButton onClick={onClose} disabled={saving}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </Header>

        <Body>
          {success && (
            <SuccessMessage>Company updated successfully!</SuccessMessage>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}

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
              />
              {formik.touched.theater_name && formik.errors.theater_name && (
                <ErrorText>{formik.errors.theater_name}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Account Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                $hasError={formik.touched.email && !!formik.errors.email}
              />
              {formik.touched.email && formik.errors.email && (
                <ErrorText>{formik.errors.email}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="primary_contact">Primary Contact</Label>
              <Input
                id="primary_contact"
                name="primary_contact"
                type="text"
                value={formik.values.primary_contact}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="primary_contact_email">Contact Email</Label>
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
              />
              {formik.touched.primary_contact_email &&
                formik.errors.primary_contact_email && (
                  <ErrorText>{formik.errors.primary_contact_email}</ErrorText>
                )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                $hasError={formik.touched.website && !!formik.errors.website}
              />
              {formik.touched.website && formik.errors.website && (
                <ErrorText>{formik.errors.website}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="number_of_members">Company Size</Label>
              <Select
                id="number_of_members"
                name="number_of_members"
                value={formik.values.number_of_members}
                onChange={formik.handleChange}
              >
                <option value="">Select size...</option>
                <option value="1-5">1-5 members</option>
                <option value="6-15">6-15 members</option>
                <option value="16-30">16-30 members</option>
                <option value="31-50">31-50 members</option>
                <option value="51+">51+ members</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </FormGroup>

            {canDelete && (
              <FormGroup>
                <CheckboxGroup>
                  <input
                    id="disabled"
                    name="disabled"
                    type="checkbox"
                    checked={formik.values.disabled}
                    onChange={formik.handleChange}
                  />
                  <label htmlFor="disabled">Disable this company account</label>
                </CheckboxGroup>
              </FormGroup>
            )}
          </form>
        </Body>

        <Footer>
          <AdminButton variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => formik.handleSubmit()}
            loading={saving}
            disabled={saving || !formik.isValid}
          >
            Save Changes
          </AdminButton>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CompanyEditModal;
