'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../../theme/styleVars';

const PublicRoleCardSkeleton: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  return (
    <RoleCardContainer>
      {/* Production name line */}
      <ProductionLineSkeleton />

      <RoleNameSkeleton />
      <RoleDescriptionSkeleton />
      <RoleDescriptionSkeleton />

      <div className="mt-[15px] flex flex-wrap gap-[10px]">
        <DetailItemSkeleton />
        <DetailItemSkeleton />
        <DetailItemSkeleton />
        <DetailItemSkeleton />
      </div>

      {/* View Production button */}
      <RoleButtonSkeleton />
    </RoleCardContainer>
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

const RoleCardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

// TODO: understand why we need to use as any to resolve the TS error for circular propTypes
const ProductionLineSkeleton = styled(SkeletonBase as any)`
  height: 14px;
  width: 30%;
  margin-bottom: 10px;
`;

const RoleNameSkeleton = styled(SkeletonBase as any)`
  height: 22px;
  width: 40%;
  margin-bottom: 10px;
`;

const RoleDescriptionSkeleton = styled(SkeletonBase as any)`
  height: 14px;
  width: 90%;
  margin-bottom: 6px;

  /* Second of the two description lines (position 4 within RoleCardContainer:
     ProductionLine, RoleName, Description, Description, ChipsRow, Button).
     Shorter width + larger margin gives the chip row breathing room. */
  &:nth-child(4) {
    width: 75%;
    margin-bottom: 15px;
  }
`;

const DetailItemSkeleton = styled(SkeletonBase as any)`
  height: 16px;
  width: 120px;
  margin-right: 15px;
  margin-bottom: 5px;

  &:nth-child(1) {
    width: 150px;
  }

  &:nth-child(2) {
    width: 130px;
  }

  &:nth-child(3) {
    width: 140px;
  }

  &:nth-child(4) {
    width: 110px;
  }
`;

const RoleButtonSkeleton = styled(SkeletonBase as any)`
  height: 40px;
  width: 180px;
  margin-top: 12px;
`;

export default PublicRoleCardSkeleton;
