import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { Dropdown } from '../../../genericComponents';
import InputField from '../../../genericComponents/Input';
import TextArea from '../../../genericComponents/TextArea';
import { neighborhoods } from '../../../utils/lookups';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';
import { FormValues } from './types';

const CompanyDetails: React.FC<{
  setForm: SetForm;
  formValues: FormValues;
  formErrors: any;
  setFormErrors: (x: any) => void;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, formValues, hasErrorCallback }) => {
  const locations = [
    { name: 'Choose one...', value: 'choose' },
    ...neighborhoods.map(neighborhood => ({
      name: neighborhood,
      value: neighborhood
    }))
  ];

  return (
    <Container>
      <Row>
        <SignUpHeader
          title="Let's get some details"
          subtitle="This is a subheader that may or may not be used on any given page"
        />
      </Row>
      <Row>
        <SignUpBody lg="6">
          <InputField
            required
            name="numberOfMembers"
            label="Number of Members"
            placeholder="Enter approx. number"
            hasErrorCallback={hasErrorCallback}
            onChange={setForm}
            requiredLabel="numberOfMembers"
            value={formValues.numberOfMembers ?? ''}
          />
          <InputField
            required
            name="primaryContact"
            label="Primary Contact"
            placeholder="First and Last Name"
            hasErrorCallback={hasErrorCallback}
            onChange={setForm}
            requiredLabel="primaryContact"
            value={formValues.primaryContact ?? ''}
          />
          <Dropdown
            name="location"
            label="Location (neighborhood)"
            options={locations}
            value={formValues.location}
            onChange={setForm}
          />
          <TextArea
            required
            name="description"
            label="Theatre Group Description"
            placeholder="Tell us more about who you are, the kinds of shows you do, or any other relevant details."
            hasErrorCallback={hasErrorCallback}
            onChange={setForm}
            requiredLabel="description"
            value={formValues.description ?? ''}
          />
        </SignUpBody>
      </Row>
    </Container>
  );
};

export default CompanyDetails;
