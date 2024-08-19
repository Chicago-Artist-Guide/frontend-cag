import React from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import Ribbon from '../../../images/icons-profile/ribbon.svg';
import { colors, fonts } from '../../../theme/styleVars';
import { ProfileAwards } from '../../SignUp/Individual/types';

const AwardCard: React.FC<{
  award: ProfileAwards;
}> = ({ award }) => {
  return (
    <AwardCardFlex>
      <Row>
        <Col lg={4}>
          <AwardIconImage src={Ribbon} fluid />
        </Col>
        <Col lg={8}>
          <AwardTitle>{award?.title}</AwardTitle>
          <AwardP>{award?.year}</AwardP>
          <AwardP>{award?.description}</AwardP>
          <AwardP>
            <a href={award?.url} target="_blank">
              View Website
            </a>
          </AwardP>
        </Col>
      </Row>
    </AwardCardFlex>
  );
};

const AwardCardFlex = styled.div`
  flex: 1 1 50%;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

const AwardIconImage = styled(Image)`
  display: block;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
`;

const AwardTitle = styled.h3`
  font-family: ${fonts.mainFont};
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const AwardP = styled.p`
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.25px;
`;

export default AwardCard;
