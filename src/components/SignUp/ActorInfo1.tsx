import React from 'react';
import RadioButton from '../../genericComponents/RadioButton';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import Checkbox from '../../genericComponents/Checkbox';
import { colors, fonts } from '../../theme/styleVars';
import yellow_blob from '../../images/yellow_blob_2.svg';

const pronouns = [
  'He/Him/His',
  'She/Her/Hers',
  'They/Them/Theirs',
  'Ze/Zir/Zirs',
  'Other'
];

const ethnicityTypes = [
  {
    name: 'Asian',
    values: [
      'East Asian (ex. China, Korea, Japan)',
      'Southeast Asian (ex. Cambodia, Thailand, Vietnam)',
      'South Asian (ex. Bangladesh, India, Pakistan)',
      'Central & West Asian (ex. Afghanistan, Iran, Uzbekistan)'
    ]
  },
  {
    name: 'Black or African American',
    values: []
  },
  {
    name: 'Indigenous',
    values: []
  },
  {
    name: 'Latinx',
    values: []
  },
  {
    name: 'MENA',
    values: []
  },
  {
    name: 'Native Hawaiian or Other Pacific Islander',
    values: []
  },
  {
    name: 'White',
    values: []
  }
];

const ActorInfo1: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { formData, setForm } = props;
  const {
    actorInfo1Pronouns,
    actorInfo1LGBTQ,
    actorInfo1Ethnicities
  } = formData;

  const isEthnicityInEthnicities = (ethnicityType: string) =>
    actorInfo1Ethnicities.indexOf(ethnicityType) > -1;

  const ethnicityChange = (checkValue: any, type: string) => {
    let newEthnicities = [...actorInfo1Ethnicities];

    if (checkValue) {
      // check ethnicity type value
      if (newEthnicities.indexOf(type) < 0) {
        newEthnicities.push(type);
      }
    } else {
      // uncheck age range value
      newEthnicities = newEthnicities.filter(aR => aR !== type);
    }

    const target = {
      name: 'actorInfo1Ethnicities',
      value: newEthnicities
    };

    setForm({ target });
  };

  // const genderRoleChange = (checkValue: any, role: string) => {
  //   let newRoles = [...actorInfo2GenderRoles];

  //   if (checkValue) {
  //     // check gender role value
  //     if (newRoles.indexOf(role) < 0) {
  //       newRoles.push(role);
  //     }
  //   } else {
  //     // uncheck gender role value
  //     newRoles = newRoles.filter(gR => gR !== role);
  //   }

  //   const target = {
  //     name: 'actorInfo2GenderRoles',
  //     value: newRoles
  //   };

  //   setForm({ target });
  // };

  return (
    <Container>
      <Row>
        <Col lg="8">
          <h1>Let's Get Some Details</h1>
          <Row>
            <Col lg="12">
              <Form.Group>
                <Container>
                  <CAGLabel>Pronouns</CAGLabel>
                  <Row>
                    <Col lg="6">
                      <Form.Control
                        aria-label="pronouns"
                        as="select"
                        name="actorInfo1Pronouns"
                        onChange={setForm}
                      >
                        <option value={undefined}>Choose...</option>
                        {pronouns.map(noun => (
                          <option value={noun}>{noun}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Row>
                  <CAGLabel>Other</CAGLabel>
                  <Row>        
                    <Col lg="6">
                      <Form.Control
                        aria-label="other pronouns"
                        as="text"
                        name="actorInfo1Pronouns"
                        onChange={setForm}
                      ></Form.Control>
                    </Col>
                  </Row>
                </Container>
              </Form.Group>
              <Form.Group>
                <CAGLabel>
                  Do you identify as part of the LGBTQIA+ community? - Private
                </CAGLabel>
                <p>A = asexual, not ally</p>
                {['Yes', 'No', 'I do not wish to respond'].map(identity => (
                  <RadioButton
                    fieldType="radio"
                    inner-h-t-m-l={identity}
                    label={identity}
                    name="actorInfo1LGBTQ"
                    onChange={setForm}
                    value={identity}
                    
                  >{identity}</RadioButton> 
                ))}
              </Form.Group>
              <Form.Group>
                <CAGLabel>Do you identify as any of the following:</CAGLabel>
                <p>
                  Note: This list is not exhaustive nor hyper-specific. The goal
                  of selecting your identity is to help cast roles that call for
                  a certain demographic. Please select as may options as you
                  feel fits your identity. More info on our process{' '}
                  <Link to="">here</Link>.
                </p>
                <Form.Control
                  as="select"
                  defaultValue=""
                  name="actorInfo1Ethinicities"
                  onChange={setForm}
                  type="checkbox"
                >
                  {ethnicityTypes.map(eth => (
                    <>
                      <Checkbox
                        checked={isEthnicityInEthnicities(eth.name)}
                        fieldType="checkbox"
                        label={eth.name}
                        name="actorInfo1Ethnicities"
                        onChange={(e: any) =>
                          ethnicityChange(e.currentTarget.checked, eth.name)
                        }
                      />
                      {/* {eth.values.length > 0 && (
                        <InnerEthnicities>
                          {eth.values.map((ethV) => (
                            <Checkbox
                              checked={isEthnicityInEthnicities(ethV)}
                              fieldType="checkbox"
                              label={ethV}
                              name="actorInfoEthnicities"
                              onChange={(e: any) =>
                                ethnicityChange(e.currentTarget.checked, ethV)
                              }
                            />
                          ))}
                        </InnerEthnicities>
                      )} */}
                    </>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
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

const InnerEthnicities = styled(Checkbox)``;

export default ActorInfo1;