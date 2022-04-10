import React from 'react';
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

  // add options for year dropdown 
  const yearOptions = [] as any[];
  for(let i = 1949; i < 2023; i++) {
    yearOptions.push(i)
  }

  const onAwardInputChange = (
    fieldValue: string,
    fieldName: string,
    i: any
  ) => {
    const newAwardValues = [...awards];
    newAwardValues[i][fieldName] = fieldValue;

    const target = {
      name: 'awards',
      value: newAwardValues
    };
    setForm({ target });
  };

  const addAwardInput = (e: any) => {
    e.preventDefault();
    const newAwardInputs = [...awards];

    newAwardInputs.push({
      title: '',
      year: '', 
      url: '',
      description: ''
    });

    const target = {
      name: 'awards',
      value: newAwardInputs
    };

    setForm({ target });
  };

  const removeAwardInput = (i: any) => {
    const newAwardValues = [...awards];
    newAwardValues.splice(i, 1);
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
          {awards.map((awardRow: number, i: any) => (
            <div key={`award-row-${i}`}>
              <Col lg="4">
                <CAGFormControl
                  as="input"
                  name="title"
                  onChange={(e: any) =>
                    onAwardInputChange(
                      e.target.value || '',
                      'title',
                      i
                    )
                  }
                  placeholder="Award or Recognition"
                  value={awards[i]['title']}
                />
                <CAGFormControl
                  as="select"
                  name="year"
                  onChange={(e: any) =>
                    onAwardInputChange(
                      e.target.value || '',
                      'year',
                      i
                    )
                  }
                  value={awards[i]['year']}
                >
                <option value="" selected disabled>Year Received</option>
                {yearOptions.map(year => {
                  return <option value={year}>{year}</option>
                })}
                </CAGFormControl>
                <CAGFormControl
                  as="input"
                  name="url"
                  onChange={(e: any) =>
                    onAwardInputChange(
                      e.target.value || '',
                      'url',
                      i
                    )
                  }
                  placeholder="Web Link"
                  value={awards[i]['url']}
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
                      i
                    )
                  }
                  placeholder="Description/Notes"
                  rows={6}
                  value={awards[i]['description']}
                />
              </Col>
            {numAwards > 1 && (
              <CAGButton>
                 <button className="delete" onClick={() => removeAwardInput(i)}>x</button>
                 <p>Delete recognition</p>
              </CAGButton>
            )}
            </div>
          ))}
          <CAGButton>
            <button className="add" onClick={addAwardInput}>+</button>
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
`

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
