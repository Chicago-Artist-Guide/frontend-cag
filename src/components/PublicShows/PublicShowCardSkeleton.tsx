import React from 'react';
import { Col, Row } from 'react-bootstrap';
import styled, { keyframes } from 'styled-components';
import { colors } from '../../theme/styleVars';

const PublicShowCardSkeleton: React.FC = () => {
  return (
    <ShowCard>
      <Row>
        <Col lg={4}>
          <ImageSkeleton />
        </Col>
        <RightCol lg={{ span: 7, offset: 1 }}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <div className="flex-grow-1">
              <TitleSkeleton />
              <TheaterSkeleton />
              <StatusSkeleton />
              <DescriptionSkeleton />
              <DescriptionSkeleton style={{ width: '85%' }} />
              <DescriptionSkeleton style={{ width: '75%' }} />
            </div>
            <div
              className="d-flex flex-shrink-1 flex-row"
              style={{ gap: '1em' }}
            >
              <ButtonSkeleton />
            </div>
          </div>
        </RightCol>
      </Row>
    </ShowCard>
  );
};

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    to right,
    ${colors.lightestGrey} 8%,
    ${colors.lightGrey} 18%,
    ${colors.lightestGrey} 33%
  );
  background-size: 800px 104px;
  animation: ${shimmer} 1.5s linear infinite forwards;
  border-radius: 4px;
`;

const ShowCard = styled.div`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
`;

// TODO: understand why we need to use as any to resolve the TS error for circular propTypes
const ImageSkeleton = styled(SkeletonBase as any)`
  width: 100%;
  height: 300px;
  border-radius: 8px;
`;

const RightCol = styled(Col)`
  padding: 20px 0;
`;

const TitleSkeleton = styled(SkeletonBase as any)`
  height: 28px;
  width: 70%;
  margin-bottom: 10px;
`;

const TheaterSkeleton = styled(SkeletonBase as any)`
  height: 20px;
  width: 50%;
  margin-bottom: 15px;
`;

const StatusSkeleton = styled(SkeletonBase as any)`
  height: 18px;
  width: 30%;
  margin-bottom: 15px;
`;

const DescriptionSkeleton = styled(SkeletonBase as any)`
  height: 16px;
  width: 100%;
  margin-bottom: 10px;
`;

const ButtonSkeleton = styled(SkeletonBase as any)`
  height: 40px;
  width: 150px;
  margin-top: 20px;
`;

export default PublicShowCardSkeleton;
