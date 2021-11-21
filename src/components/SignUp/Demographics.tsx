import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';

const Demographics: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  
  const { formData, setForm } = props;
  const {
    demographicsUnionStatus, // checkboxes for Unions or non-union
    demographicsAgency,
    demographicsWebsites, // { url: string, websiteType: string }
    demographicsBio
  } = formData;

  console.log(demographicsWebsites)

  const onWebsiteInputChange = (
    fieldValue: string,
    fieldName: string,
    i: any
  ) => {
    // indexing to assign each website value a number

    const newWebsiteValues = [...demographicsWebsites];
    newWebsiteValues[i][fieldName] = fieldValue;

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues
    };
    setForm({ target });
  };

  const removeWebsiteInput = (i: any) => {
    const newWebsiteValues = [...demographicsWebsites];
    newWebsiteValues.splice(i, 1);
    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues
    };
    setForm({ target });
  };

  const addWebsiteInput = (e: any) => {
    e.preventDefault();
    const newWebsiteInputs = [...demographicsWebsites];

    newWebsiteInputs.push({
      url: '',
      websiteType: ''
    });

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteInputs
    };

    setForm({ target });
  };

  const numWebsites = demographicsWebsites.length;

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ALMOST DONE!</Title>
          <Tagline>Just a few more questions.</Tagline>
        </Col>
      </Row>
    </Container>
  );
};

export default Demographics;
