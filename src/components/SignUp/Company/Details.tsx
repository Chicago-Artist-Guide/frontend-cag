import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { Dropdown } from '../../../genericComponents';
import InputField from '../../../genericComponents/Input';
import TextArea from '../../../genericComponents/TextArea';
import { neighborhoods } from '../../../utils/lookups';
import { ErrorMessage } from '../../../utils/validation';
import SignUpHeader from '../shared/Header';
import { CompanyFormData } from './types';

const CompanyDetails: React.FC<{
  setForm: SetForm;
  formData: CompanyFormData;
  formErrors: any;
  setFormErrors: (x: any) => void;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, formData, setFormErrors, formErrors, hasErrorCallback }) => {
  console.log({ formData });
  const locations = [
    { name: 'Choose one...', value: '' },
    ...neighborhoods.map(neighborhood => ({
      name: neighborhood,
      value: neighborhood
    }))
  ];

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('onCHange', e, e.currentTarget.value, e.target.value);
  };

  return (
    <Container>
      <Row>
        <SignUpHeader
          title="Let's get some details"
          subtitle="This is a subheader that may or may not be used on any given page"
        />
      </Row>
      <Row>
        <Col lg="6">
          <Form>
            <InputField
              required
              name="numberOfMembers"
              label="Number of Members"
              placeholder="Enter approx. number"
              hasErrorCallback={hasErrorCallback}
              onChange={setForm}
              requiredLabel="numberOfMembers"
              value={formData.numberOfMembers ?? ''}
            />
            <InputField
              required
              name="primaryContact"
              label="Primary Contact"
              placeholder="First and Last Name"
              hasErrorCallback={hasErrorCallback}
              onChange={setForm}
              requiredLabel="primaryContact"
              value={formData.primaryContact ?? ''}
            />
            <Dropdown
              controlId="location"
              label="Location (neighborhood)"
              options={locations}
              value={formData.location}
              onChange={onChange}
            />
            <TextArea
              required
              name="description"
              label="Theatre Group Description"
              placeholder="Tell us more about who you are, the kinds of shows you do, or any other relevant details."
              hasErrorCallback={hasErrorCallback}
              onChange={setForm}
              requiredLabel="description"
              value={formData.description ?? ''}
            />
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyDetails;
