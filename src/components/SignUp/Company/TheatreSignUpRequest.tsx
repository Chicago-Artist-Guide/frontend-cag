import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Col,
  Row,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback
} from 'reactstrap';
import { addDoc, collection } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PageContainer from '../../layout/PageContainer';
import { Title } from '../../layout/Titles';
import Button from '../../../components/shared/Button';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { colors, fonts, breakpoints } from '../../../theme/styleVars';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Logo from '../../../images/cagLogo1.svg';

// Custom URL validation that adds protocol if missing
const urlValidator = (url: string) => {
  if (!url) return url;

  // Check if URL already has a protocol
  if (!/^(?:f|ht)tps?:\/\//i.test(url)) {
    // Add https:// prefix if missing
    return `https://${url}`;
  }
  return url;
};

const TheatreSignUpRequest: React.FC = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      theatreCompanyName: '',
      theatreWebsite: '',
      companyType: 'Equity',
      businessType: 'Non-profit',
      contactPerson: '',
      contactEmail: '',
      additionalInfo: ''
    },
    validationSchema: Yup.object({
      theatreCompanyName: Yup.string().required(
        'Theatre Company Name is required'
      ),
      theatreWebsite: Yup.string()
        .test('is-url', 'Invalid URL', function (value) {
          if (!value) return false; // Handle empty case for required validation

          // If it already has a protocol, use Yup's built-in URL validation
          if (/^(?:f|ht)tps?:\/\//i.test(value)) {
            try {
              return Yup.string().url().isValidSync(value);
            } catch (e) {
              return false;
            }
          }

          // If no protocol, add one and then validate
          try {
            return Yup.string().url().isValidSync(`https://${value}`);
          } catch (e) {
            return false;
          }
        })
        .required('Theatre Website is required'),
      contactPerson: Yup.string().required('Contact Person is required'),
      contactEmail: Yup.string()
        .email('Invalid email address')
        .required('Contact Email is required')
    }),
    onSubmit: async (values) => {
      try {
        // Format the website URL if needed before submission
        const formattedValues = {
          ...values,
          theatreWebsite: urlValidator(values.theatreWebsite)
        };

        // add to theatre_requests collection; this is different than
        await addDoc(
          collection(firebaseFirestore, 'theatre_requests'),
          formattedValues
        );

        // send email
        await addDoc(collection(firebaseFirestore, 'mail'), {
          to: 'anna@chicagoartistguide.org', // goes to Anna for now?
          message: {
            subject: 'New Theatre Sign-Up Request',
            text: `A new theatre sign-up request has been submitted:\n\n${JSON.stringify(formattedValues, null, 2)}`
          }
        });

        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting form: ', error);
      }
    }
  });

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>Theatre Company CAG Sign-up</Title>
          <p>
            Please complete this short form to receive a link to set up you
            theatre company's page and begin to posting jobs! A review typically
            takes up to 48 hours. Questions? Email Executive Director, Anna
            Schutz (she/her), anna@chicagoartistguide.org
          </p>
          {submitted && (
            <>
              <p>
                <strong>
                  Thank you for your submission! We will be in touch soon.
                </strong>
              </p>
              <Link to="/events" style={{ textDecoration: 'none' }}>
                <EventTicket>
                  <TicketLeftSide>
                    <LogoContainer>
                      <img src={Logo} alt="CAG Logo" />
                    </LogoContainer>
                  </TicketLeftSide>
                  <TicketRightSide>
                    <TicketTitle>Discover Upcoming Events</TicketTitle>
                    <TicketDescription>
                      While you wait for your registration to be processed,
                      check out the latest theatre events in Chicago!
                    </TicketDescription>
                    <Button
                      text="VIEW EVENTS"
                      variant="primary"
                      icon={faCalendarAlt}
                    />
                  </TicketRightSide>
                </EventTicket>
              </Link>
            </>
          )}
          <hr className="mb-12 mt-12" />
        </Col>
      </Row>
      {!submitted && (
        <Form onSubmit={formik.handleSubmit}>
          <Row>
            <Col lg="6">
              <FormGroup>
                <Label for="theatreCompanyName">Theatre Company Name</Label>
                <Input
                  id="theatreCompanyName"
                  name="theatreCompanyName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.theatreCompanyName}
                  invalid={
                    formik.touched.theatreCompanyName &&
                    !!formik.errors.theatreCompanyName
                  }
                />
                <FormFeedback>{formik.errors.theatreCompanyName}</FormFeedback>
              </FormGroup>
            </Col>
            <Col lg="6">
              <FormGroup>
                <Label for="theatreWebsite">Theatre Website</Label>
                <Input
                  id="theatreWebsite"
                  name="theatreWebsite"
                  type="text"
                  placeholder="theatrecompanyexample.com"
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    // Auto-format on blur for better UX
                    if (
                      e.target.value &&
                      !/^(?:f|ht)tps?:\/\//i.test(e.target.value)
                    ) {
                      formik.setFieldValue(
                        'theatreWebsite',
                        `https://${e.target.value}`
                      );
                    }
                    formik.handleBlur(e);
                  }}
                  value={formik.values.theatreWebsite}
                  invalid={
                    formik.touched.theatreWebsite &&
                    !!formik.errors.theatreWebsite
                  }
                />
                <small className="form-text text-muted">
                  Just enter your domain name - we'll add https:// for you
                </small>
                <FormFeedback>{formik.errors.theatreWebsite}</FormFeedback>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg="6">
              <FormGroup tag="fieldset">
                <Label>Equity</Label>
                <div>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="companyType"
                        value="Equity"
                        onChange={formik.handleChange}
                        checked={formik.values.companyType === 'Equity'}
                      />{' '}
                      Equity
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="companyType"
                        value="Non-Equity"
                        onChange={formik.handleChange}
                        checked={formik.values.companyType === 'Non-Equity'}
                      />{' '}
                      Non-Equity
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>
            </Col>
            <Col lg="6">
              <FormGroup tag="fieldset">
                <Label>Business Type</Label>
                <div>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="businessType"
                        value="Non-profit"
                        onChange={formik.handleChange}
                        checked={formik.values.businessType === 'Non-profit'}
                      />{' '}
                      Non-profit
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="businessType"
                        value="For profit"
                        onChange={formik.handleChange}
                        checked={formik.values.businessType === 'For profit'}
                      />{' '}
                      For profit
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg="6">
              <FormGroup>
                <Label for="contactPerson">
                  Best person for CAG to contact if needed (Name, Title)
                  <em className="block text-xs">
                    Will not be shared externally
                  </em>
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.contactPerson}
                  invalid={
                    formik.touched.contactPerson &&
                    !!formik.errors.contactPerson
                  }
                />
                <FormFeedback>{formik.errors.contactPerson}</FormFeedback>
              </FormGroup>
            </Col>
            <Col lg="6">
              <FormGroup>
                <Label for="contactEmail">
                  Contact Person's Email
                  <em className="block text-xs">
                    Will not be shared externally
                  </em>
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.contactEmail}
                  invalid={
                    formik.touched.contactEmail && !!formik.errors.contactEmail
                  }
                />
                <FormFeedback>{formik.errors.contactEmail}</FormFeedback>
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label for="additionalInfo">
              Anything else you'd like to share?
            </Label>
            <Input
              id="additionalInfo"
              name="additionalInfo"
              type="textarea"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.additionalInfo}
            />
          </FormGroup>
          <Button type="submit" text="Submit" variant="primary" />
        </Form>
      )}
    </PageContainer>
  );
};

const EventTicket = styled.div`
  display: flex;
  max-width: 800px;
  margin: 30px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: ${breakpoints.md}) {
    flex-direction: column;
  }
`;

const TicketLeftSide = styled.div`
  background-color: #f5f5f5;
  padding: 25px;
  width: 35%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    padding: 20px;
  }
`;

const TicketRightSide = styled.div`
  background-color: white;
  padding: 25px;
  width: 65%;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
  }
`;

const TicketTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 24px;
  margin-bottom: 15px;
  color: ${colors.darkGrey};
`;

const TicketDescription = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
  color: ${colors.secondaryFontColor};
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  img {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 120px;
  }
`;

export default TheatreSignUpRequest;
