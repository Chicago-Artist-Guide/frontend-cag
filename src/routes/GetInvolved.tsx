import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout';
import { Title, Tagline } from '../components/layout/Titles';
import { useFirebaseContext } from '../context/FirebaseContext';
import InputField from '../components/shared/Input';
import Button from '../components/shared/Button';
import { colors, fonts, breakpoints } from '../theme/styleVars';
import { createEmail } from '../components/Messages/api';

type RoleOpportunity = {
  id: string;
  roleName: string;
  productionName: string;
  description: string;
  productionId: string;
  moreInfoUrl?: string;
  googleFormUrl?: string;
  roleType?: string;
  pay?: string;
  location?: string;
  ongoing?: boolean;
};

const contactFormSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required')
});

const DEMO_ROLES: RoleOpportunity[] = [
  {
    id: 'demo-1',
    roleName: 'Project Manager',
    productionName: 'Demo Production',
    description:
      'We are seeking a talented and experienced manager to lead special projects, ensuring smooth execution and coordination of initiatives. The ideal candidate should be a proactive problem solver with strong interpersonal and organizational skills, capable of effectively navigating deadlines and facilitating clear communication across diverse teams and stakeholders.',
    productionId: 'demo',
    googleFormUrl: 'https://forms.google.com/example',
    roleType: 'Offstage',
    pay: '$250',
    location: 'Chicago'
  },
  {
    id: 'demo-2',
    roleName: 'Grant Writer',
    productionName: 'Demo Production',
    description:
      'If you have a talent for writing and have been in and around Chicago theatre, this is for you! Assist in project research, editing, and grant writing for a variety of funding opportunities.',
    productionId: 'demo',
    googleFormUrl: 'https://forms.google.com/example',
    roleType: 'Offstage',
    pay: '$250',
    location: 'Chicago'
  },
  {
    id: 'demo-3',
    roleName: 'Marketing Assistant',
    productionName: 'Demo Production',
    description:
      'This marketing assistant works closely with the administrative team to facilitate social media posts, conduct outreach to community organizations, and support event marketing efforts within the city.',
    productionId: 'demo',
    googleFormUrl: 'https://forms.google.com/example',
    roleType: 'Offstage',
    pay: '$250',
    location: 'Chicago'
  }
];

const GetInvolved: React.FC = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [searchParams] = useSearchParams();
  const [roles, setRoles] = useState<RoleOpportunity[]>([]);
  const [ongoingRoles, setOngoingRoles] = useState<RoleOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const isDemoMode = searchParams.get('demo') === 'true';

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        // If demo mode is enabled, use demo roles
        if (isDemoMode) {
          setRoles(DEMO_ROLES);
          setOngoingRoles([]);
          setLoading(false);
          return;
        }

        const temporalRoles: RoleOpportunity[] = [];
        const ongoingRolesList: RoleOpportunity[] = [];

        // Fetch role opportunities from Firebase
        try {
          const roleOpportunitiesRef = collection(
            firebaseFirestore,
            'roleOpportunities'
          );
          const roleOpportunitiesQuery = query(roleOpportunitiesRef);
          const roleOpportunitiesSnapshot = await getDocs(
            roleOpportunitiesQuery
          );

          roleOpportunitiesSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const role: RoleOpportunity = {
              id: doc.id,
              roleName: data.roleName || data.role_name || '',
              productionName: data.productionName || data.production_name || '',
              description: data.description || '',
              productionId: data.productionId || data.production_id || '',
              googleFormUrl:
                data.googleFormUrl || data.google_form_url || undefined,
              moreInfoUrl: data.moreInfoUrl || data.more_info_url || undefined,
              roleType: data.roleType || data.role_type || undefined,
              pay: data.pay || undefined,
              location: data.location || 'Chicago',
              ongoing: data.ongoing || false
            };

            // Separate ongoing and temporal roles
            if (role.ongoing) {
              ongoingRolesList.push(role);
            } else {
              temporalRoles.push(role);
            }
          });
        } catch (error) {
          console.error(
            'Error fetching role opportunities from Firebase:',
            error
          );
        }

        setRoles(temporalRoles.slice(0, 6)); // Limit to 6 temporal roles for display
        setOngoingRoles(ongoingRolesList); // Show all ongoing roles
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [firebaseFirestore, isDemoMode]);

  const handleContactSubmit = async (
    values: {
      firstName: string;
      lastName: string;
      email: string;
      message: string;
    },
    { setSubmitting, resetForm }: any
  ) => {
    try {
      // Determine recipient based on environment
      const isDev = import.meta.env.DEV;
      const recipientEmail = isDev
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

      const messageHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> ${values.firstName} ${values.lastName}</p>
<p><strong>Email:</strong> <a href="mailto:${values.email}">${values.email}</a></p>
<h3>Message:</h3>
<p>${values.message.replace(/\n/g, '<br>')}</p>
      `.trim();

      // Send email via Firebase mail collection
      const emailSent = await createEmail(
        firebaseFirestore,
        recipientEmail,
        subject,
        messageText,
        messageHtml
      );

      if (emailSent) {
        // Set success state first, then reset form
        setFormSubmitted(true);
        // Reset form completely - explicitly clear values, touched, and errors
        resetForm({
          values: {
            firstName: '',
            lastName: '',
            email: '',
            message: ''
          },
          touched: {},
          errors: {}
        });
        // Reset success message after 5 seconds
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
    <PageContainer>
      <HeaderSection>
        <Title>Get involved</Title>
        <Tagline>
          Join us in building a more connected and inclusive Chicago theatre
          community.
        </Tagline>
      </HeaderSection>

      {/* Current Opportunities Section */}
      <Section>
        <SectionTitle>Current openings</SectionTitle>
        <SectionDescription>
          We are actively looking for these open roles.
        </SectionDescription>

        {loading ? (
          <LoadingText>Loading opportunities...</LoadingText>
        ) : roles.length === 0 ? (
          <EmptyStateText>
            No open role opportunities at this time. Check back soon!
          </EmptyStateText>
        ) : (
          <RoleList>
            {roles.map((role, index) => (
              <RoleCard
                key={role.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RoleMetadata>
                  <RoleTitle>{role.roleName}</RoleTitle>
                  {role.roleType && (
                    <MetadataItem>
                      <MetadataLabel>Type:</MetadataLabel>
                      <MetadataValue>{role.roleType}</MetadataValue>
                    </MetadataItem>
                  )}
                  {role.pay && (
                    <MetadataItem>
                      <MetadataLabel>Pay:</MetadataLabel>
                      <MetadataValue>{role.pay}</MetadataValue>
                    </MetadataItem>
                  )}
                  <ProductionName>{role.productionName}</ProductionName>
                  {role.location && (
                    <RoleLocation>Location: {role.location}</RoleLocation>
                  )}
                </RoleMetadata>
                <RoleContent>
                  <RoleDescriptionLabel>Role Description</RoleDescriptionLabel>
                  <RoleDescription>{role.description}</RoleDescription>
                  <MoreInfoButton
                    href={role.googleFormUrl || role.moreInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    More Info
                  </MoreInfoButton>
                </RoleContent>
              </RoleCard>
            ))}
          </RoleList>
        )}
      </Section>

      {/* Ongoing Positions Section */}
      {!loading && ongoingRoles.length > 0 && (
        <Section>
          <SectionTitle>Ongoing open positions</SectionTitle>
          <SectionDescription>
            We are always looking to fill these roles.
          </SectionDescription>

          <BoardList>
            {ongoingRoles.map((role, index) => (
              <BoardCard
                key={role.id}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <BoardMetadata>
                  <BoardTitle>{role.roleName}</BoardTitle>
                  {role.location && (
                    <BoardCommitment>Location: {role.location}</BoardCommitment>
                  )}
                </BoardMetadata>
                <BoardContent>
                  <BoardDescriptionLabel>
                    Role Description
                  </BoardDescriptionLabel>
                  <BoardDescription>{role.description}</BoardDescription>
                  <MoreInfoButton
                    href={role.googleFormUrl || role.moreInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    More Info
                  </MoreInfoButton>
                </BoardContent>
              </BoardCard>
            ))}
          </BoardList>
        </Section>
      )}

      {/* Contact Form Section */}
      <Section>
        <SectionTitle>Your unique skills could help us grow!</SectionTitle>
        <SectionDescription>
          Tell us how you'd like to contribute.
        </SectionDescription>

        <ContactFormContainer>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              message: ''
            }}
            validationSchema={formSubmitted ? undefined : contactFormSchema}
            validateOnChange={!formSubmitted}
            validateOnBlur={!formSubmitted}
            onSubmit={handleContactSubmit}
          >
            {({ values, handleChange, isSubmitting, errors, touched }) => (
              <Form>
                <NameFieldsRow>
                  <InputField
                    first
                    label="First name"
                    name="firstName"
                    placeholder="First name"
                    value={values.firstName}
                    onChange={handleChange}
                    required={!formSubmitted}
                    requiredLabel="First name"
                    error={
                      !formSubmitted && touched.firstName && errors.firstName
                        ? errors.firstName
                        : null
                    }
                  />
                  <InputField
                    label="Last name"
                    name="lastName"
                    placeholder="Last name"
                    value={values.lastName}
                    onChange={handleChange}
                    required={!formSubmitted}
                    requiredLabel="Last name"
                    error={
                      !formSubmitted && touched.lastName && errors.lastName
                        ? errors.lastName
                        : null
                    }
                  />
                </NameFieldsRow>
                <InputField
                  label="Email address"
                  name="email"
                  fieldType="email"
                  placeholder="Email address"
                  value={values.email}
                  onChange={handleChange}
                  required={!formSubmitted}
                  requiredLabel="Email"
                  error={
                    !formSubmitted && touched.email && errors.email
                      ? errors.email
                      : null
                  }
                />
                <TextAreaWrapper>
                  <TextAreaLabel htmlFor="message">Message</TextAreaLabel>
                  <TextAreaField
                    id="message"
                    name="message"
                    placeholder="Let us know how you would like to contribute to our efforts."
                    value={values.message}
                    onChange={handleChange}
                    rows={6}
                    required={!formSubmitted}
                    error={
                      !formSubmitted && touched.message && errors.message
                        ? errors.message
                        : null
                    }
                  />
                  {!formSubmitted && touched.message && errors.message && (
                    <TextAreaError>{errors.message}</TextAreaError>
                  )}
                </TextAreaWrapper>

                {formSubmitted && (
                  <SuccessMessage>
                    Thank you! Your message has been sent successfully. We'll be
                    in touch soon.
                  </SuccessMessage>
                )}

                <Button
                  type="submit"
                  text={isSubmitting ? 'Sending...' : 'Send Message'}
                  variant="primary"
                  disabled={isSubmitting}
                  style={{ marginTop: '20px' }}
                />
              </Form>
            )}
          </Formik>
        </ContactFormContainer>
      </Section>

      <EndOfPage>— thank you for your interest —</EndOfPage>
    </PageContainer>
  );
};

export default GetInvolved;

// Styled Components
const HeaderSection = styled.div`
  margin-bottom: 20px;
  text-align: center;
  padding: 0 16px;

  @media (min-width: ${breakpoints.sm}) {
    margin-bottom: 28px;
    padding: 0 24px;
  }

  @media (min-width: ${breakpoints.md}) {
    margin-bottom: 40px;
    padding: 0;
  }
`;

const Section = styled.section`
  padding: 32px 16px;

  @media (min-width: ${breakpoints.sm}) {
    padding: 40px 24px;
  }

  @media (min-width: ${breakpoints.md}) {
    padding: 56px 32px;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 64px 0;
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  color: ${colors.secondaryFontColor};
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.75rem;
    margin-bottom: 16px;
  }
`;

const SectionDescription = styled.p`
  font-family: ${fonts.lora};
  font-size: 0.95rem;
  color: ${colors.italicColor};
  font-style: italic;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
  padding: 0 8px;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1rem;
    margin-bottom: 32px;
    padding: 0;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #888;
  margin: 20px 0;
  font-size: 0.9rem;
  padding: 0 16px;
  line-height: 1.5;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1rem;
    margin: 24px 0;
    padding: 0;
  }
`;

const EmptyStateText = styled.p`
  text-align: center;
  color: #888;
  margin: 20px 0;
  font-size: 0.9rem;
  font-style: italic;
  padding: 0 16px;
  line-height: 1.5;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1rem;
    margin: 24px 0;
    padding: 0;
  }
`;

const RoleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: ${breakpoints.sm}) {
    gap: 24px;
  }

  @media (min-width: ${breakpoints.md}) {
    gap: 32px;
  }
`;

const RoleCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
  width: 100%;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: 250px 1fr;
    gap: 0;
  }

  @media (min-width: ${breakpoints.lg}) {
    grid-template-columns: 300px 1fr;
  }
`;

const RoleMetadata = styled.div`
  background: #fffbe7;
  border-radius: 8px 8px 0 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: ${breakpoints.md}) {
    border-radius: 8px 0 0 8px;
    padding: 28px;
  }
`;

const RoleTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.125rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 8px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1.25rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.3rem;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  gap: 4px;
  font-size: 0.875rem;
  line-height: 1.4;
  flex-wrap: wrap;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.9rem;
  }
`;

const MetadataLabel = styled.span`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  color: ${colors.secondaryFontColor};
`;

const MetadataValue = styled.span`
  font-family: ${fonts.mainFont};
  color: #666;
`;

const ProductionName = styled.div`
  font-family: ${fonts.lora};
  font-size: 0.9rem;
  font-style: italic;
  color: ${colors.italicColor};
  margin-top: 8px;
  line-height: 1.4;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.95rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
  }
`;

const RoleLocation = styled.div`
  font-family: ${fonts.mainFont};
  font-size: 0.8125rem;
  color: #888;
  margin-top: 4px;
  line-height: 1.4;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.85rem;
  }
`;

const RoleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border-radius: 0 0 8px 8px;

  @media (min-width: ${breakpoints.md}) {
    border-radius: 0 8px 8px 0;
    padding: 28px;
  }
`;

const RoleDescriptionLabel = styled.h4`
  font-family: ${fonts.montserrat};
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 4px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1rem;
  }
`;

const RoleDescription = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 0.9rem;
  color: #444;
  line-height: 1.6;
  margin-bottom: 12px;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.95rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
  }
`;

const MoreInfoButton = styled.a`
  display: inline-block;
  background: ${colors.primary};
  color: ${colors.white};
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 20px;
  padding: 10px 20px;
  text-decoration: none;
  align-self: flex-start;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  cursor: pointer;

  &:hover {
    background: ${colors.darkPrimary};
    transform: scale(1.05);
    text-decoration: none;
    color: ${colors.white};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.85rem;
    padding: 8px 20px;
    min-height: 40px;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 0.9rem;
    padding: 10px 24px;
  }
`;

const BoardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: ${breakpoints.sm}) {
    gap: 24px;
  }

  @media (min-width: ${breakpoints.md}) {
    gap: 32px;
  }
`;

const BoardCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
  width: 100%;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: 250px 1fr;
    gap: 0;
  }

  @media (min-width: ${breakpoints.lg}) {
    grid-template-columns: 300px 1fr;
  }
`;

const BoardMetadata = styled.div`
  background: #c9d2e6;
  border-radius: 8px 8px 0 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: ${breakpoints.md}) {
    border-radius: 8px 0 0 8px;
    padding: 28px;
  }
`;

const BoardTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-size: 1.125rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 8px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1.25rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.3rem;
  }
`;

const BoardCommitment = styled.div`
  font-family: ${fonts.mainFont};
  font-size: 0.8125rem;
  color: #666;
  line-height: 1.4;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.85rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 0.9rem;
  }
`;

const BoardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border-radius: 0 0 8px 8px;

  @media (min-width: ${breakpoints.md}) {
    border-radius: 0 8px 8px 0;
    padding: 28px;
  }
`;

const BoardDescriptionLabel = styled.h4`
  font-family: ${fonts.montserrat};
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${colors.secondaryFontColor};
  margin-bottom: 4px;
  line-height: 1.3;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 1rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1.1rem;
  }
`;

const BoardDescription = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 0.9rem;
  color: #444;
  line-height: 1.6;
  margin-bottom: 12px;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.95rem;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
  }
`;

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

const TextAreaWrapper = styled.div`
  margin-top: 25px;
  width: 100%;
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

const EndOfPage = styled.div`
  text-align: center;
  font-style: italic;
  color: #888;
  margin: 24px 0;
  font-size: 0.875rem;
  padding: 0 16px;
  line-height: 1.5;

  @media (min-width: ${breakpoints.sm}) {
    font-size: 0.95rem;
    margin: 32px 0;
  }

  @media (min-width: ${breakpoints.md}) {
    font-size: 1rem;
    margin: 40px 0;
    padding: 0;
  }
`;
