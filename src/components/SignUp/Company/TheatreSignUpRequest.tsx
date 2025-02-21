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
import PageContainer from '../../layout/PageContainer';
import { Title } from '../../layout/Titles';
import Button from '../../../components/shared/Button';
import { useFirebaseContext } from '../../../context/FirebaseContext';

const TheatreSignUpRequest: React.FC = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      theatreCompanyName: '',
      theatreWebsite: '',
      contactPerson: '',
      contactEmail: '',
      walkthrough: '',
      additionalInfo: ''
    },
    validationSchema: Yup.object({
      theatreCompanyName: Yup.string().required(
        'Theatre Company Name is required'
      ),
      theatreWebsite: Yup.string()
        .url('Invalid URL')
        .required('Theatre Website is required'),
      contactPerson: Yup.string().required('Contact Person is required'),
      contactEmail: Yup.string()
        .email('Invalid email address')
        .required('Contact Email is required'),
      walkthrough: Yup.string().required('Please select an option')
    }),
    onSubmit: async (values) => {
      try {
        // add to theatre_requests collection; this is different than
        await addDoc(collection(firebaseFirestore, 'theatre_requests'), values);

        // send email
        await addDoc(collection(firebaseFirestore, 'mail'), {
          to: 'anna@chicagoartistguide.org', // goes to Anna for now?
          message: {
            subject: 'New Theatre Sign-Up Request',
            text: `A new theatre sign-up request has been submitted:\n\n${JSON.stringify(values, null, 2)}`
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
            <p>
              <strong>
                Thank you for your submission! We will be in touch soon.
              </strong>
            </p>
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
                  type="url"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.theatreWebsite}
                  invalid={
                    formik.touched.theatreWebsite &&
                    !!formik.errors.theatreWebsite
                  }
                />
                <FormFeedback>{formik.errors.theatreWebsite}</FormFeedback>
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
          <FormGroup tag="fieldset">
            <legend className="text-base font-medium">
              Would you like a 1:1 walkthrough with one of our User Experience
              Designers?
              <em className="block text-xs">
                These are 30 minute virtual sessions to show you all the
                features of the platform and a chance for you to share your
                feedback
              </em>
            </legend>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="walkthrough"
                  value="yes"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.walkthrough === 'yes'}
                  invalid={
                    formik.touched.walkthrough && !!formik.errors.walkthrough
                  }
                />
                Yes
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="walkthrough"
                  value="no"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.walkthrough === 'no'}
                  invalid={
                    formik.touched.walkthrough && !!formik.errors.walkthrough
                  }
                />
                No
              </Label>
            </FormGroup>
            <FormFeedback>{formik.errors.walkthrough}</FormFeedback>
          </FormGroup>
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

export default TheatreSignUpRequest;
