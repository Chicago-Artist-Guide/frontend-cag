import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { Tagline, Title } from '../../layout/Titles';
import InputField from '../../../genericComponents/Input';
import Button from '../../../genericComponents/Button';
import 'react-datepicker/dist/react-datepicker.css';

const Credits: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  const { pastPerformances } = formData;
  const [startDate, setStartDate] = useState(new Date() as any);
  const [endDate, setEndDate] = useState(new Date() as any);

  const setCreditInputs = (creditInputBlocks: any) => {
    const target = {
      name: pastPerformances,
      value: creditInputBlocks
    };
    setForm({ target });
  };

  const onCreditFieldChange = (
    fieldName: string,
    fieldValue: string,
    i: number
  ) => {
    const newCredits = [...pastPerformances];
    newCredits[i][fieldName] = fieldValue;
    setCreditInputs(newCredits);
  };

  const removeCreditBlock = (i: number) => {
    const newCredits = [...pastPerformances];
    newCredits.splice(i, 1);
    setCreditInputs(newCredits);
  };

  const addCreditBlock = () => {
    setCreditInputs([
      ...pastPerformances,
      {
        title: '',
        group: '',
        location: '',
        startDate: '',
        endDate: '',
        url: '',
        role: '',
        director: '',
        musicalDirector: ''
      }
    ]);
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ADD YOUR PAST PERFORMANCES</Title>
          <Tagline>Where might we have seen you?</Tagline>
        </Col>
      </Row>
      {pastPerformances.map((credit: any, i: number) => (
        <Row>
          <Col lg="4">
            <Form>
              <InputField
                name="title"
                onChange={setForm}
                placeholder="Show Title"
                value={pastPerformances.title}
              />
              <InputField
                name="group"
                onChange={setForm}
                placeholder="Theatre or Location"
                value={pastPerformances.group}
              />
              <InputField
                name="url"
                onChange={setForm}
                placeholder="Web Link"
                value={pastPerformances.url}
              />
              <InputField
                name="role"
                onChange={setForm}
                placeholder="Role"
                value={pastPerformances.role}
              />
              <InputField
                name="director"
                onChange={setForm}
                placeholder="Director"
                value={pastPerformances.director}
              />
              <InputField
                name="musicalDirector"
                onChange={setForm}
                placeholder="Musical Director"
                value={pastPerformances.musicalDirector}
              />
            </Form>
            <Button
              onClick={addCreditBlock}
              text="Save and add another past performance"
            />
          </Col>
          <Col lg="4">
            <InputField
              name="group"
              onChange={setForm}
              placeholder="Theatre Group"
              value={pastPerformances.group}
            />
            <h5>Running Dates</h5>
            <DatePicker
              name="startDate"
              onChange={startDate => setStartDate(startDate)}
              selected={startDate}
              value={pastPerformances.startDate}
            />
            <h6>through</h6>
            <DatePicker
              name="endDate"
              onChange={endDate => setEndDate(endDate)}
              selected={endDate}
              value={pastPerformances.endDate}
            />
            <div>{credit.title}</div>
            <input
              name="creditTitle"
              onChange={e => onCreditFieldChange('title', e.target.value, i)}
              type="text"
              value={credit.title}
            />
            {i ? (
              <a href="#" onClick={() => removeCreditBlock(i)}>
                Delete
              </a>
            ) : null}
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default Credits;
