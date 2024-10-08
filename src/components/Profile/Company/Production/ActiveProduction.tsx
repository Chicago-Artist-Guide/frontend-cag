import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../../components/shared';
import { colors, fonts } from '../../../../theme/styleVars';
import { Production } from '../types';

const ActiveProduction: React.FC<{ show: Production }> = ({ show }) => {
  const navigate = useNavigate();
  const roles = show?.roles ?? [];
  const hasRoles = roles?.length > 0;

  const manageProduction = () => {
    navigate(`/production/${show.production_id}/manage`);
  };

  const viewMatches = () => {
    navigate(
      `/profile/search/talent/${show.production_id}/${roles[0].role_id}`
    );
  };

  return (
    <ShowCard>
      <Row>
        <Col lg={4}>
          <ShowImage src={show?.production_image_url} fluid />
        </Col>
        <RightCol lg={{ span: 7, offset: 1 }}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <div className="flex-grow-1">
              <ShowName>{show?.production_name}</ShowName>
              <ShowStatus>{show?.status}</ShowStatus>
              <ShowDescription>{show?.description}</ShowDescription>
            </div>
            <div
              className="d-flex flex-shrink-1 flex-row"
              style={{ gap: '1em' }}
            >
              <ShowButton
                onClick={manageProduction}
                text="Manage"
                type="button"
                variant="primary"
              />
              <ShowButton
                disabled={!hasRoles}
                onClick={viewMatches}
                text="View Matches"
                type="button"
                variant="primary"
              />
            </div>
          </div>
        </RightCol>
      </Row>
    </ShowCard>
  );
};

export const RightCol = styled(Col)`
  padding: 20px 0;
`;

const ShowButton = styled(Button)`
  background: ${colors.slate};
  border-color: ${colors.slate};
`;

export const ShowDescription = styled.p`
  font-family: ${fonts.mainFont};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.25px;
  max-width: 294px;
`;

export const ShowStatus = styled.h3`
  height: 14px;
  font-family: ${fonts.lora};
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;
  color: ${colors.slate};
`;

export const ShowName = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.07em;
`;

export const ShowImage = styled(Image)`
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  background: ${colors.lightGrey};
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
`;

export const ShowCard = styled.div`
  margin-bottom: 20px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

export default ActiveProduction;
