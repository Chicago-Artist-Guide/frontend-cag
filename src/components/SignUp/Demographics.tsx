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
    demographicsWebsites, // { url: string, type: string }
    demographicsBio
  } = formData;

  const isUnionsInUnions = (unionType: string) =>
    demographicsUnionStatus.indexOf(unionType) > -1;

  const demographicWebsiteChange = (url: any, type: string) => {
    let newWebsites = [...demographicsWebsites];

    if (url) {
      // check ethnicity type value
      if (newWebsites.indexOf(type) < 0) {
        newWebsites.push(type);
      }
    } else {
      // uncheck age range value
      newWebsites = newWebsites.filter(aR => aR !== type);
    }

    const target = {
      name: 'demographicsWebsites',
      value: newWebsites
    };

    setForm({ target });
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ALMOST DONE!</Title>
          <Tagline>Just a few more questions.</Tagline>
        </Col>
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
      </Row>
    </Container>
  );
};



const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
`;



const PrivacyPar = styled.p`
  color: ${colors.mainFont};
  font-family: ${fonts.lora};
  font-size: 18px;
  letter-spacing: 0px;
  margin-top: 17px;
`;

export default Demographics;
