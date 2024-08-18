import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { SetForm } from 'react-hooks-helper';
import Checkbox from '../../../genericComponents/Checkbox';
import { Tagline, Title } from '../../layout/Titles';
import { colors, fonts } from '../../../theme/styleVars';
import {
  skillCheckboxes,
  IndividualProfile2Data,
  SkillCheckbox
} from './types';

const AdditionalSkills: React.FC<{
  setForm: SetForm;
  formData: IndividualProfile2Data;
}> = (props) => {
  const { formData, setForm } = props;
  const { additionalSkillsCheckboxes, additionalSkillsManual } = formData;

  const [input, setInput] = useState('');
  const [skillTags, setTags] = useState([
    ...additionalSkillsManual
  ] as string[]);
  const [isKeyReleased, setIsKeyReleased] = useState(false);

  const isAdditionalSkillsCheckboxes = (skillOption: SkillCheckbox) =>
    additionalSkillsCheckboxes.indexOf(skillOption) > -1;

  const skillOptionChange = (checkValue: boolean, skill: SkillCheckbox) => {
    let newSkills = [...additionalSkillsCheckboxes];

    if (checkValue) {
      // check value
      if (newSkills.indexOf(skill) < 0) {
        newSkills.push(skill);
      }
    } else {
      // uncheck value
      newSkills = newSkills.filter((sO) => sO !== skill);
    }

    const target = {
      name: 'additionalSkillsCheckboxes',
      value: newSkills
    };

    setForm({ target });
  };

  const addTag = () => {
    const trimmedInput = input.trim();
    if (trimmedInput.length && !skillTags.includes(trimmedInput)) {
      setTags((prevState) => [...prevState, trimmedInput]);
      setInput('');
    }
  };

  const deleteTag = (index: any) => {
    setTags((prevState) => prevState.filter((tag, i) => i !== index));
  };

  const onKeyDown = (e: any) => {
    const { key } = e;
    const trimmedInput = input.trim();

    if (
      (key === ',' || key === 'Enter') &&
      trimmedInput.length &&
      !skillTags.includes(trimmedInput)
    ) {
      e.preventDefault();
      setTags((prevState) => [...prevState, trimmedInput]);
      setInput('');
    }

    if (
      key === 'Backspace' &&
      !input.length &&
      skillTags.length &&
      isKeyReleased
    ) {
      e.preventDefault();
      const tagsCopy = [...skillTags];
      const poppedTag = tagsCopy.pop() ?? '';
      setTags(tagsCopy);
      setInput(poppedTag);
    }
    setIsKeyReleased(false);
  };

  const onKeyUp = () => {
    setIsKeyReleased(true);
  };

  useEffect(() => {
    const allSkills = [...skillTags];

    const target = {
      name: 'additionalSkillsManual',
      value: allSkills
    };

    setForm({ target });
  }, [skillTags]);

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ANY SPECIAL SKILLS?</Title>
          <CAGTagline>Tell us more about what you can do.</CAGTagline>
          <CAGFormGroup>
            <BoldP>I am interested in roles that require:</BoldP>
            {skillCheckboxes.map((skill) => (
              <CAGCheckbox
                checked={isAdditionalSkillsCheckboxes(skill)}
                fieldType="checkbox"
                key={`skill-chk-${skill}`}
                label={skill}
                name="additionalSkillsCheckboxes"
                onChange={(e: any) =>
                  skillOptionChange(e.currentTarget.checked, skill)
                }
              />
            ))}
          </CAGFormGroup>
          <CAGFormGroup>
            <BoldP>Additional Skills</BoldP>
            <CAGInput>
              <input
                name="additionalSkillsManual"
                onChange={(e: any) => {
                  const { value } = e.target;
                  setInput(value);
                }}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                placeholder="Type to add a skill..."
                value={input}
              />
              <button onClick={addTag}>+</button>
            </CAGInput>
            <CAGContainer>
              {skillTags.map((tag, index) => (
                <CAGTag key={`${tag}-${index}`}>
                  <div className="tag">
                    {tag}
                    <button onClick={() => deleteTag(index)}>x</button>
                  </div>
                </CAGTag>
              ))}
            </CAGContainer>
          </CAGFormGroup>
        </Col>
      </Row>
    </Container>
  );
};

const CAGInput = styled.div`
  position: relative;

  input {
    border: 1px solid ${colors.lightGrey};
    border-radius: 7px;
    font-family: ${fonts.mainFont};
    padding: 10px;
    padding-left: 10px;
    width: 60%;
  }

  button {
    position: absolute;
    right: 40%;
    top: -10px;
    border: none;
    background-color: unset;
    font-size: 40px;
    cursor: pointer;
    color: ${colors.mint};
  }
`;

const CAGContainer = styled.div`
  color: ${colors.gray};
  display: flex;
  max-width: 60%;
  overflow: scroll;
  padding-left: none;
  width: 600%;
`;

const CAGTag = styled.div`
  .tag {
    align-items: center;
    margin: 20px 0;
    margin-right: 10px;
    font-family: ${fonts.mainFont};
    padding-left: 15px;
    padding-right: 10px;
    padding-top: 0px;
    padding-bottom: 0px;
    border: 1.5px solid ${colors.mint};
    border-radius: 20px;
    background-color: white;
    white-space: nowrap;
    color: ${colors.mainFont};
  }

  .tag button {
    display: inline;
    padding: 4px;
    border: none;
    background-color: unset;
    cursor: pointer;
    color: ${colors.lightGrey};
  }
`;

const BoldP = styled.p`
  font-weight: bold;
  color: ${colors.secondaryFontColor};
`;

const CAGTagline = styled(Tagline)`
  color: ${colors.italicColor};
`;

const CAGCheckbox = styled(Checkbox)`
  color: ${colors.secondaryFontColor};
`;

const CAGFormGroup = styled(Form.Group)`
  margin-bottom: 2em;
`;

export default AdditionalSkills;
