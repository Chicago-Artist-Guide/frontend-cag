import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';
import Form from 'react-bootstrap/Form';
import InputField from '../../genericComponents/Input';

const Training: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  const { trainingInstitution, trainingCity, trainingDegree } = formData;
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ADD YOUR TRAINING DETAILS</Title>
          <Tagline>Tell us where you learned to do what you do.</Tagline>
        </Col>
      </Row>
      <Row>
        <Col lg="4">
          <Form>
            <InputField
              name="trainingInstitution"
              onChange={setForm}
              placeholder="Institution"
              value={trainingInstitution || ''}
            />
          </Form>
        </Col>
      </Row>
      <Row>
        <Col lg="4">
          <InputField
            name="trainingCity"
            onChange={setForm}
            placeholder="City"
            value={trainingCity || ''}
          />
        </Col>
        <Col className="mt-4" lg="2">
          <Form.Control as="select">
            <option>State</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="DC">District Of Columbia</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </Form.Control>
        </Col>
      </Row>
      <Row>
        <Col className="mb-4" lg="4">
          <InputField
            name="trainingDegree"
            onChange={setForm}
            placeholder="Degree"
            value={trainingDegree || ''}
          />
        </Col>
      </Row>
      <Row>
        <Col className="mt-4" lg="6">
          <Tagline>Notes/Details</Tagline>
          <Form.Group controlId="formControlTextarea1">
            <Form.Control
              as="textarea"
              placeholder="Provide any additional information here"
              rows={6}
            />
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
};

export default Training;
