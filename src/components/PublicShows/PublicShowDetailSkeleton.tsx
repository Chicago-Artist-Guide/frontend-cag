import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { colors } from '../../theme/styleVars';
import PublicRoleCardSkeleton from './PublicRoleCardSkeleton';

const PublicShowDetailSkeleton: React.FC = () => {
  return (
    <>
      <Row>
        <Col lg={12}>
          <BackLinkSkeleton />
          <TitleSkeleton />
          <TheaterNameSkeleton />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={4}>
          <ImageSkeleton />

          <InfoSectionSkeleton>
            <InfoLabelSkeleton />
            <InfoValueSkeleton />
          </InfoSectionSkeleton>

          <InfoSectionSkeleton>
            <InfoLabelSkeleton />
            <InfoValueSkeleton />
          </InfoSectionSkeleton>

          <InfoSectionSkeleton>
            <InfoLabelSkeleton />
            <InfoValueSkeleton />
          </InfoSectionSkeleton>

          <ButtonSkeleton />
        </Col>

        <Col lg={8}>
          <DescriptionSkeleton />
          <DescriptionSkeleton style={{ width: '95%' }} />
          <DescriptionSkeleton style={{ width: '90%' }} />
          <DescriptionSkeleton style={{ width: '85%' }} />

          <SectionTitleSkeleton />

          {/* Show a few role card skeletons */}
          <PublicRoleCardSkeleton />
          <PublicRoleCardSkeleton />

          <SectionTitleSkeleton style={{ marginTop: '40px' }} />
          <PublicRoleCardSkeleton />
        </Col>
      </Row>
    </>
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

const BackLinkSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 120px;
  margin-bottom: 15px;
`;

const TitleSkeleton = styled(SkeletonBase)`
  height: 36px;
  width: 60%;
  margin-bottom: 10px;
`;

const TheaterNameSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 40%;
  margin-bottom: 30px;
`;

const ImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  height: 300px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const InfoSectionSkeleton = styled.div`
  margin-bottom: 15px;
`;

const InfoLabelSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 30%;
  margin-bottom: 5px;
`;

const InfoValueSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 70%;
`;

const ButtonSkeleton = styled(SkeletonBase)`
  height: 40px;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const DescriptionSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 100%;
  margin-bottom: 10px;
`;

const SectionTitleSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 200px;
  margin-top: 30px;
  margin-bottom: 20px;
`;

export default PublicShowDetailSkeleton;
