import React, { useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { Dropdown, InputField } from '../../../components/shared';
import { getOptions } from '../../../utils/helpers';
import { neighborhoods } from '../../../utils/lookups';
import { FormRadio } from '../../Profile/Form/Inputs';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';
import { CompanyData } from './types';
import { checkForErrors } from './utils';

const numOfMemberRanges = [
  { name: 'Choose one...', value: 'choose' },
  ...['less than 5', '5-14', '15-30', '30+'].map((val) => ({
    name: val,
    value: val
  }))
];
const equity = ['Equity', 'Non-Equity'];

const requiredFields = ['numberOfMembers', 'equity'];

const locations = [
  { name: 'Choose one...', value: 'choose' },
  ...neighborhoods.map((neighborhood) => ({
    name: neighborhood,
    value: neighborhood
  }))
];

const CompanyDetails: React.FC<{
  stepId: string;
  setForm: SetForm;
  formValues: CompanyData;
  setStepErrors: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, stepId, formValues, setStepErrors }) => {
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
        <SignUpBody lg="6" xs="12">
          <Dropdown
            name="numberOfMembers"
            label="Number of Members"
            options={numOfMemberRanges}
            value={formValues.numberOfMembers}
            onChange={setForm}
          />
          {/* <InputField
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
          /> */}
          <Dropdown
            name="location"
            label="Location (neighborhood)"
            options={locations}
            value={formValues.location}
            onChange={setForm}
          />
          <InputField
            name="website"
            label="Link to website"
            placeholder="Website URL"
            hasErrorCallback={setStepErrors}
            onChange={setForm}
            requiredLabel="website"
            value={formValues.website ?? ''}
          />
          <FormRadio
            name="equity"
            label="Equity"
            options={getOptions(equity)}
            checked={formValues.equity}
            onChange={setForm}
          />
          {/* <TextArea
            required
            name="description"
            label="Theatre Group Description"
            placeholder="Tell us more about who you are, the kinds of shows you do, or any other relevant details."
            hasErrorCallback={setStepErrors}
            onChange={setForm}
            requiredLabel="description"
            value={formValues.description ?? ''}
          /> */}
        </SignUpBody>
      </Row>
    </Container>
  );
};

export default CompanyDetails;
