import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../../components/shared';
import { breakpoints, colors, fonts } from '../../../../theme/styleVars';
import { Production } from '../types';

const InactiveShow: React.FC<{ show: Production }> = ({ show }) => {
  const navigate = useNavigate();
  const manageProduction = () => {
    navigate(`/production/${show.production_id}/manage`);
  };
  return (
    <ShowCard>
      <Row>
        <Col xs={12} lg={4}>
          <ShowImage src={show?.production_image_url} fluid />
        </Col>
        <RightCol xs={12} lg={{ span: 7, offset: 1 }}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <div className="flex-grow-1">
              <ShowName>{show?.production_name}</ShowName>
              <ShowStatus>{show?.status}</ShowStatus>
            </div>
            <ButtonContainer className="d-flex flex-shrink-1 flex-column flex-md-row">
              <ShowButton
                onClick={manageProduction}
                text="Manage"
                type="button"
                variant="primary"
              />
            </ButtonContainer>
          </div>
        </RightCol>
      </Row>
    </ShowCard>
  );
};

const ButtonContainer = styled.div`
  gap: 1em;
  margin-top: 16px;

  @media (max-width: ${breakpoints.md}) {
    gap: 12px;
    margin-top: 20px;

    button {
      width: 100%;
      min-height: 48px;
      font-size: 14px;
    }
  }
`;

export const RightCol = styled(Col)`
  padding: 20px 0;

  @media (max-width: ${breakpoints.lg}) {
    padding: 0;
    margin-top: 4px;
  }
`;

const ShowButton = styled(Button)`
  background: ${colors.slate};
  border-color: ${colors.slate};
  min-height: 44px;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    min-height: 48px;
    font-size: 14px;
  }
`;

const ShowStatus = styled.h3`
  height: 14px;
  font-family: ${fonts.lora};
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;
  color: ${colors.slate};
  margin: 4px 0 8px 0;

  @media (max-width: ${breakpoints.md}) {
    margin: 6px 0 4px 0;
  }
`;

const ShowName = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.07em;
  margin: 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 2px;
  }
`;

const ShowImage = styled(Image)`
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  background: ${colors.lightGrey};
  margin-left: auto;
  margin-right: auto;
  height: 100%;
  width: 100%;
  object-fit: cover;

  @media (max-width: ${breakpoints.lg}) {
    position: relative;
    height: auto;
    min-height: 240px;
    margin-bottom: 20px;
  }

  @media (min-width: ${breakpoints.lg}) {
    position: absolute;
  }
`;

export const ShowCard = styled.div`
  margin-bottom: 20px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;

  @media (max-width: ${breakpoints.md}) {
    padding: 24px 20px;
    margin-bottom: 24px;
    max-width: 100%;
  }

  @media (min-width: ${breakpoints.md}) {
    max-width: 50%;
  }
`;

export default InactiveShow;
