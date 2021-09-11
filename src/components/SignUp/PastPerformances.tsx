import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { fonts } from '../../theme/styleVars';
import InputField from '../../genericComponents/Input';
import Button from '../../genericComponents/Button';

const pastPerformance = {
  title: '',
  group: '',
  location: '',
  startDate: '',
  endDate: '',
  url: '',
  role: '',
  director: '',
  musicalDirector: '',
  recognition: ''
};

const Performances: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  // const { pastPerformances } = formData;

  const [pastPerformanceData, setPastPerformanceData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const savePerformance = () => {
    setForm(formData);
  };

  return (
    <Container>
      <Row>
        <Title>ADD YOUR PAST PERFORMANCES</Title>
        <Title>Where might we have seen you?</Title>
        <Col lg="4">
          <Form>
            <InputField
              label="Show Title"
              name="title"
              onChange={setPastPerformanceData}
              value={pastPerformance.title || ''}
            />
            <InputField
              label="Theatre Group"
              name="group"
              onChange={setPastPerformanceData}
              value={pastPerformance.group || ''}
            />
            <InputField
              label="Theatre or Location"
              name="location"
              onChange={setPastPerformanceData}
              value={pastPerformance.location || ''}
            />
            <DatePicker
              name="startDate"
              onChange={startDate => setStartDate(startDate)}
              selected={startDate}
              value={pastPerformance.startDate || ''}
            />
            <h3>through</h3>
            <DatePicker
              name="endDate"
              onChange={endDate => setEndDate(endDate)}
              selected={endDate}
              value={pastPerformance.endDate || ''}
            />
            <InputField
              label="Web Link"
              name="url"
              onChange={setPastPerformanceData}
              value={pastPerformance.url || ''}
            />
            <InputField
              label="Role"
              name="role"
              onChange={setPastPerformanceData}
              value={pastPerformance.role || ''}
            />
            <InputField
              label="Director"
              name="director"
              onChange={setPastPerformanceData}
              value={pastPerformance.director || ''}
            />
            <InputField
              label="Musical Director"
              name="musicalDirector"
              onChange={setPastPerformanceData}
              value={pastPerformance.startDate || ''}
            />
            <InputField
              label="Recognition"
              name="recognition"
              onChange={setPastPerformanceData}
              value={pastPerformance.recognition || ''}
            />
          </Form>
        </Col>
      </Row>
      <Button
        onClick={savePerformance}
        text="Save and add another past performance"
      />
    </Container>
  );
};

const Title = styled.h1`
  font: ${fonts.montserrat} 48px bold;
  padding: 48px 0px;
`;

export default Performances;
