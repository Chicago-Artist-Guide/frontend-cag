import React from 'react';
import Image from 'react-bootstrap';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Col, Row, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

const Features: React.FC<{
  features: any;
  emptyPlaceholder: string;
}> = ({ features }) => {
  console.log(features);
  return (
    <Container>
      <Row>
        {features.map((feature: any) => (
          <Col xs={12} md={6} lg={4}>
            <Row>
              <Col xs={6}>
                {feature.imageUrl !== undefined ? (
                  <ImageDisplay src={feature.imageUrl} />
                ) : (
                  <PlaceholderImage>
                    <FontAwesomeIcon
                      className="bod-icon"
                      icon={faCamera}
                      size="lg"
                    />
                  </PlaceholderImage>
                )}
              </Col>
              <Col xs={6}>
                <FeatureInformation>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureSubtitle>{feature.year}</FeatureSubtitle>
                  <FeatureSubtitle>{feature.role}</FeatureSubtitle>
                </FeatureInformation>
              </Col>
            </Row>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

const FeatureSubtitle = styled.p`
  font-size: 12px;
`;

const FeatureTitle = styled.h6`
  font-weight: bold;
  font-size: 14px;
`;

const FeatureInformation = styled.div`
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ImageDisplay = styled.img`
  height: 150px;
  width: 100px;
  float: left;
  background: ${colors.lightGrey};
  font-size: 68px;
  background-repeat: no-repeat;
  background-size: cover;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  margin-right: 10px;
  margin-bottom: 30px;
`;

const PlaceholderImage = styled.div`
  height: 150px;
  width: 100px;
  background: ${colors.lightGrey};
  color: white;
  font-size: 32px;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 8px;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 30px;
`;

export default Features;
