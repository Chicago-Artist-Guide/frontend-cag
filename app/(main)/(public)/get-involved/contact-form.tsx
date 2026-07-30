'use client';

import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import Button from '../../../../src/components/shared/Button';
import InputField from '../../../../src/components/shared/Input';
import { createEmail } from '../../../../src/components/Messages/api';
import { isDevelopment } from '../../../../src/config/publicEnv';
import { useFirebaseContext } from '../../../../src/context/FirebaseContext';
import {
  escapeHtml,
  escapeHtmlWithLineBreaks
} from '../../../../src/utils/escapeHtml';
import { breakpoints, colors, fonts } from '../../../../src/theme/styleVars';

// The interactive "contact us" form from src/routes/GetInvolved.tsx, split
// out as its own Client Component: Formik state and the Firestore write
// (via createEmail) both require the browser. Everything around it —
// heading, copy, role/board lists — stays server-rendered in page.tsx.
interface ContactFormValues {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

const contactFormSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required')
});

const ContactForm: React.FC = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = async (
    values: ContactFormValues,
    { resetForm, setSubmitting }: any
  ) => {
    try {
      const recipientEmail = isDevelopment
        ? 'chris@ctkadvisors.net'
        : 'anna@chicagoartistguide.org';

      const subject = 'Get Involved - Contact Form Submission';
      const messageText = `
New contact form submission from the Get Involved page:

Name: ${values.firstName} ${values.lastName}
Email: ${values.email}

Message:
${values.message}
      `.trim();

      // Escape every user-supplied value: this is a hand-built HTML string
      // emailed to CAG staff, so React's JSX escaping does not apply here.
      // Mail clients block <script>, but unescaped input still allows
      // injected phishing links, tracking pixels, and body spoofing — and the
      // mailto: href is an attribute context, where a bare quote breaks out.
      const messageHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> ${escapeHtml(values.firstName)} ${escapeHtml(
        values.lastName
      )}</p>
<p><strong>Email:</strong> <a href="mailto:${escapeHtml(
        values.email
      )}">${escapeHtml(values.email)}</a></p>
<h3>Message:</h3>
<p>${escapeHtmlWithLineBreaks(values.message)}</p>
      `.trim();

      const emailSent = await createEmail(
        firebaseFirestore,
        recipientEmail,
        subject,
        messageText,
        messageHtml
      );

      if (emailSent) {
        setFormSubmitted(true);
        resetForm({
          errors: {},
          touched: {},
          values: { email: '', firstName: '', lastName: '', message: '' }
        });
        setTimeout(() => {
          setFormSubmitted(false);
        }, 5000);
      } else {
        setFormSubmitted(false);
        console.error('Failed to send email');
        alert(
          'There was an error sending your message. Please try again or email us directly.'
        );
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormSubmitted(false);
      alert(
        'There was an error sending your message. Please try again or email us directly.'
      );
    }
    setSubmitting(false);
  };

  return (
    <ContactFormContainer>
      <Formik
        initialValues={{ email: '', firstName: '', lastName: '', message: '' }}
        onSubmit={handleContactSubmit}
        validateOnBlur={!formSubmitted}
        validateOnChange={!formSubmitted}
        validationSchema={formSubmitted ? undefined : contactFormSchema}
      >
        {({ errors, handleChange, isSubmitting, touched, values }) => (
          <Form>
            <NameFieldsRow>
              <InputField
                error={
                  !formSubmitted && touched.firstName && errors.firstName
                    ? errors.firstName
                    : null
                }
                first
                label="First name"
                name="firstName"
                onChange={handleChange}
                placeholder="First name"
                required={!formSubmitted}
                requiredLabel="First name"
                value={values.firstName}
              />
              <InputField
                error={
                  !formSubmitted && touched.lastName && errors.lastName
                    ? errors.lastName
                    : null
                }
                label="Last name"
                name="lastName"
                onChange={handleChange}
                placeholder="Last name"
                required={!formSubmitted}
                requiredLabel="Last name"
                value={values.lastName}
              />
            </NameFieldsRow>
            <InputField
              error={
                !formSubmitted && touched.email && errors.email
                  ? errors.email
                  : null
              }
              fieldType="email"
              label="Email address"
              name="email"
              onChange={handleChange}
              placeholder="Email address"
              required={!formSubmitted}
              requiredLabel="Email"
              value={values.email}
            />
            <div className="mt-[25px] w-[100%]">
              <TextAreaLabel htmlFor="message">Message</TextAreaLabel>
              <TextAreaField
                error={
                  !formSubmitted && touched.message && errors.message
                    ? errors.message
                    : null
                }
                id="message"
                name="message"
                onChange={handleChange}
                placeholder="Let us know how you would like to contribute to our efforts."
                rows={6}
                value={values.message}
              />
              {!formSubmitted && touched.message && errors.message && (
                <TextAreaError>{errors.message}</TextAreaError>
              )}
            </div>

            {formSubmitted && (
              <SuccessMessage>
                Thank you! Your message has been sent successfully. We'll be in
                touch soon.
              </SuccessMessage>
            )}

            <Button
              disabled={isSubmitting}
              style={{ marginTop: '20px' }}
              text={isSubmitting ? 'Sending...' : 'Send Message'}
              type="submit"
              variant="primary"
            />
          </Form>
        )}
      </Formik>
    </ContactFormContainer>
  );
};

export default ContactForm;

const ContactFormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: ${colors.white};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;

  @media (min-width: ${breakpoints.sm}) {
    padding: 32px;
  }

  @media (min-width: ${breakpoints.md}) {
    padding: 40px;
  }
`;

const NameFieldsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  width: 100%;

  @media (min-width: ${breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    /* When fields are side-by-side, ensure they align at the top */
    > div > div {
      margin-top: 0 !important;
    }
  }

  > div {
    width: 100%;
    min-width: 0;
  }
`;

const TextAreaLabel = styled.label`
  display: block;
  font-family: ${fonts.montserrat};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.secondaryFontColor};
  margin-bottom: 8px;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.9375rem;
  }
`;

const TextAreaField = styled.textarea<{ error?: string | null }>`
  width: 100%;
  padding: 12px 16px;
  font-family: ${fonts.mainFont};
  font-size: 1rem;
  border: 1px solid ${(props) => (props.error ? colors.salmon : '#ccc')};
  border-radius: 4px;
  resize: vertical;
  transition: border-color 0.2s ease;
  min-height: 120px;
  box-sizing: border-box;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }

  &::placeholder {
    color: #999;
  }

  @media (min-width: ${breakpoints.sm}) {
    min-height: 140px;
  }
`;

const TextAreaError = styled.div`
  color: ${colors.salmon};
  font-family: ${fonts.mainFont};
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
  line-height: 1.4;
`;

const SuccessMessage = styled.div`
  background: ${colors.yoda};
  color: ${colors.darkPrimary};
  padding: 16px;
  border-radius: 4px;
  margin-top: 20px;
  font-family: ${fonts.mainFont};
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.95rem;
    padding: 18px;
  }
`;
