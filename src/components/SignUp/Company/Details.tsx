import React, { useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { Dropdown } from '../../../genericComponents';
import InputField from '../../../genericComponents/Input';
import TextArea from '../../../genericComponents/TextArea';
import { neighborhoods } from '../../../utils/lookups';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';
import { CompanyData } from './types';
import { checkForErrors } from './utils';
import { ErrorMessage } from '../../../utils/validation';

const requiredFields = ['numberOfMembers', 'primaryContact', 'description'];

const CompanyDetails: React.FC<{
  stepId: string;
  setForm: SetForm;
  formValues: CompanyData;
  setStepErrors: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, stepId, formValues, setStepErrors }) => {
  const locations = [
    { name: 'Choose one...', value: 'choose' },
    ...neighborhoods.map((neighborhood) => ({
      name: neighborhood,
      value: neighborhood
    }))
  ];

  useEffect(() => {
    if (requiredFields.length > 0) {
      const hasErrors = checkForErrors(requiredFields, formValues);
      setStepErrors(stepId, hasErrors);
    }
  }, [formValues]);

  return (
    <Container>
      <Row>
        <SignUpHeader title="Let's get some details" />
      </Row>
      <Row>
        <SignUpBody lg="6">
          <InputField
            required
            name="numberOfMembers"
            label="Number of Members"
            placeholder="Enter approx. number"
            hasErrorCallback={setStepErrors}
            onChange={setForm}
            requiredLabel="numberOfMembers"
            value={formValues.numberOfMembers ?? ''}
          />
          <InputField
            required
            name="primaryContact"
            label="Primary Contact"
            placeholder="First and Last Name"
            hasErrorCallback={setStepErrors}
            onChange={setForm}
            requiredLabel="primaryContact"
            value={formValues.primaryContact ?? ''}
          />
          <InputField
            required
            name="primaryContactEmail"
            label="Primary Contact Email"
            placeholder="Email Address"
            hasErrorCallback={setStepErrors}
            onChange={setForm}
            requiredLabel="primaryContactEmail"
            validationRegexMessage={ErrorMessage.EmailFormat}
            validationRegexName="emailAddress"
            value={formValues.primaryContactEmail ?? ''}
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
            hasErrorCallback={setStepErrors}
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
