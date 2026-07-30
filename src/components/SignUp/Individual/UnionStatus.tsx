import React, { useEffect } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { yellow_blob } from '../../../config/publicImages';
import { unionOptionLabels, unionOptions } from '../../../utils/lookups';
import { Checkbox } from '../../shared';
import { Tagline, Title } from '../../layout/Titles';
import { IndividualData } from './types';

const UnionStatus: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = ({ formData, setForm, hasErrorCallback }) => {
  const { demographicsUnionStatus } = formData;

  const isSelected = (option: string) =>
    Array.isArray(demographicsUnionStatus) &&
    demographicsUnionStatus.includes(option);

  const handleChange = (option: string, checked: boolean) => {
    const current = Array.isArray(demographicsUnionStatus)
      ? demographicsUnionStatus
      : [];
    const next = checked
      ? [...current, option]
      : current.filter((u) => u !== option);
    setForm({ target: { name: 'demographicsUnionStatus', value: next } });
  };

  const hasError = !(
    Array.isArray(demographicsUnionStatus) && demographicsUnionStatus.length > 0
  );

  useEffect(() => {
    hasErrorCallback('unionStatus', hasError);
  }, [hasError]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <Row>
        <Col lg="8">
          <Title>UNION STATUS</Title>
          <Tagline>Select all that apply (at least one required).</Tagline>
          <Form.Group className="form-group">
            {unionOptions.map((option) => (
              <Checkbox
                key={`union-option-${option}`}
                checked={isSelected(option)}
                label={unionOptionLabels[option]}
                name={option}
                onChange={(e: any) =>
                  handleChange(option, e.currentTarget.checked)
                }
              />
            ))}
            {hasError && (
              <p className="mt-[0.5rem] text-[14px] text-salmon">
                Please select at least one union status.
              </p>
            )}
          </Form.Group>
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
export default UnionStatus;
