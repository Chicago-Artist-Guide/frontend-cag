import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import { colors, fonts } from '../../theme/styleVars';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { Tagline, Title } from '../layout/Titles';

const Awards: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  const { awards } = formData;
  const [awardId, setAwardId] = useState(1);

  // add options for year dropdown
  const yearOptions = [] as any[];
  for (let i = 1949; i < 2023; i++) {
    yearOptions.push(i);
  }

  const onAwardInputChange = (
    fieldValue: string,
    fieldName: string,
    id: any
  ) => {
    const newAwardValues = [...awards];
    const findIndex = newAwardValues.findIndex(award => award.id === id);
    newAwardValues[findIndex][fieldName] = fieldValue;

    const target = {
      name: 'awards',
      value: newAwardValues
    };

    setForm({ target });
  };

  const addAwardInput = (e: any) => {
    e.preventDefault();
    const newAwardId = awardId + 1;
    const newAwardInputs = [...awards];

    newAwardInputs.push({
      id: newAwardId,
      title: '',
      year: '',
      url: '',
      description: ''
    });

    const target = {
      name: 'awards',
      value: newAwardInputs
    };

    setAwardId(newAwardId);
    setForm({ target });
  };

  const removeAwardInput = (e: any, id: any) => {
    e.preventDefault();

    const newAwardValues = [...awards];
    const findIndex = newAwardValues.findIndex(award => award.id === id);
    newAwardValues.splice(findIndex, 1);

    const target = {
      name: 'awards',
      value: newAwardValues
    };

    setForm({ target });
  };

  const numAwards = awards.length;

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ANY AWARDS OR RECOGNITION?</Title>
          <Tagline>Don't be shy, brag about it.</Tagline>
        </Col>
      </Row>
      <Row>
        <Col lg="12">
          {awards.map((awardRow: any, i: any) => (
            <div key={`award-row-${awardRow.id}`}>
              <Col lg="4">
                <CAGFormControl
                  as="input"
                  name="title"
                  onChange={(e: any) =>
                    onAwardInputChange(
                      e.target.value || '',
                      'title',
                      awardRow.id
                    )
                  }
                  placeholder="Award or Recognition"
                  value={awardRow.title}
                />
                <CAGFormControl
                  as="select"
                  name="year"
                  onChange={(e: any) =>
                    onAwardInputChange(
                      e.target.value || '',
                      'year',
                      awardRow.id
                    )
                  }
                  value={awardRow.year}
                >
                  <option disabled selected value="">
                    Year Received
                  </option>
                  {yearOptions.map(year => {
                    return <option value={year}>{year}</option>;
                  })}
                </CAGFormControl>
                <CAGFormControl
                  as="input"
                  name="url"
                  onChange={(e: any) =>
                    onAwardInputChange(e.target.value || '', 'url', awardRow.id)
                  }
                  placeholder="Web Link"
                  value={awardRow.url}
                />
              </Col>
              <Col lg="6">
                <CAGFormControl
                  as="textarea"
                  name="description"
                  onChange={(e: any) =>
                    onAwardInputChange(
                      e.target.value || '',
                      'description',
                      awardRow.id
                    )
                  }
                  placeholder="Description/Notes"
                  rows={6}
                  value={awardRow.description}
                />
              </Col>
              {numAwards > 1 && (
                <CAGButton>
                  <button
                    className="delete"
                    onClick={(e: any) => removeAwardInput(e, awardRow.id)}
                  >
                    x
                  </button>
                  <p>Delete recognition</p>
                </CAGButton>
              )}
            </div>
          ))}
          <CAGButton>
            <button className="add" onClick={addAwardInput}>
              +
            </button>
            <p>Add another recognition</p>
          </CAGButton>
        </Col>
      </Row>
    </Container>
  );
};

const CAGButton = styled.div`
  button {
    padding: 4px;
    border: none;
    background-color: unset;
    cursor: pointer;

    &.add {
      color: ${colors.darkGreen};
      font-size: 30px;
    }

    &.delete {
      color: ${colors.salmon};
      font-size: 20px;
    }
  }

  p {
    font-family: ${fonts.mainFont};
    display: inline;
  }
`;

const CAGFormControl = styled(Form.Control)`
  margin-top: 2em;
  border: 1px solid ${colors.lightGrey};
  border-radius: 7px;
  font-family: ${fonts.mainFont};
  padding: 8px;
  padding-left: 10px;
  width: 100%;
`;

export default Awards;
