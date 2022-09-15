import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { Dropdown } from '../../../genericComponents';
import InputField from '../../../genericComponents/Input';
import TextArea from '../../../genericComponents/TextArea';
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
    console.log(e.currentTarget.value, e.target.value);
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
              value={formData.description ?? ''}
            />
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyDetails;

const neighborhoods = [
  'Rogers Park',
  'West Ridge',
  'Uptown',
  'Lincoln Square',
  'North Center',
  'Lake View',
  'Lincoln Park',
  'Near North Side',
  'Edison Park',
  'Norwood Park',
  'Jefferson Park',
  'Forest Glen',
  'North Park',
  'Albany Park',
  'Portage Park',
  'Irving Park',
  'Dunning',
  'Montclare',
  'Belmont Cragin',
  'Hermosa',
  'Avondale',
  'Logan Square',
  'Humboldt Park',
  'West Town',
  'Austin',
  'West Garfield Park',
  'East Garfield Park',
  'Near West Side',
  'North Lawndale',
  'South Lawndale',
  'Lower West Side',
  'The Loop',
  'Near South Side',
  'Armour Square',
  'Douglas',
  'Oakland',
  'Fuller Park',
  'Grand Boulevard',
  'Kenwood',
  'Washington Park',
  'Hyde Park',
  'Woodlawn',
  'South Shore',
  'Chatham',
  'Avalon Park',
  'South Chicago',
  'Burnside',
  'Calumet Heights',
  'Roseland',
  'Pullman',
  'South Deering',
  'East Side',
  'West Pullman',
  'Riverdale',
  'Hegewisch',
  'Garfield Ridge',
  'Archer Heights',
  'Brighton Park',
  'McKinley Park',
  'Bridgeport',
  'New City',
  'West Elsdon',
  'Gage Park',
  'Clearing',
  'West Lawn',
  'Chicago Lawn',
  'West Englewood',
  'Englewood',
  'Greater Grand Crossing',
  'Ashburn',
  'Auburn Gresham',
  'Beverly',
  'Washington Heights',
  'Mount Greenwood',
  'Morgan Park',
  "O'Hare",
  'Edgewater'
];
