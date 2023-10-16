import React from 'react';
import styled from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import { fonts } from '../../../theme/styleVars';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import { SetForm } from 'react-hooks-helper';
import { Tagline, Title } from '../../layout/Titles';
import GenericAccordion from '../../../genericComponents/GenericAccordion';
import Checkbox from '../../../genericComponents/Checkbox';
import { offstageRolesOptions } from '../../Profile/shared/offstageRolesOptions';
import type {
  OffStageRoleCategory,
  OffStageRoleSection,
  OffStageRoleByCategory,
  TransformedOffStageRoleSection,
  TransformedOffStageRoleByCategory
} from '../../Profile/shared/profile.types';
import type { IndividualData } from './types';
import yellow_blob_1 from '../../../images/yellow_blob_1.svg';

const OffstageRoles: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
}> = (props) => {
  const { formData, setForm } = props;

  const {
    offstageRolesGeneral,
    offstageRolesProduction,
    offstageRolesScenicAndProperties,
    offstageRolesLighting,
    offstageRolesSound,
    offstageRolesHairMakeupCostumes
  } = formData;

  const sectionStateValueOptions = {
    offstageRolesGeneral,
    offstageRolesProduction,
    offstageRolesScenicAndProperties,
    offstageRolesLighting,
    offstageRolesSound,
    offstageRolesHairMakeupCostumes
  };

  const categoryToSectionStateValueKey: {
    [key in OffStageRoleCategory]: keyof typeof sectionStateValueOptions;
  } = {
    general: 'offstageRolesGeneral',
    production: 'offstageRolesProduction',
    scenicAndProperties: 'offstageRolesScenicAndProperties',
    lighting: 'offstageRolesLighting',
    sound: 'offstageRolesSound',
    hairMakeupCostumes: 'offstageRolesHairMakeupCostumes'
  };

  const transformOffStageRoleSection = (
    category: OffStageRoleCategory,
    section: OffStageRoleSection
  ): TransformedOffStageRoleSection => {
    return {
      sectionStateName: section.category,
      textHeader: section.name,
      checkboxes: section.options,
      sectionStateValue:
        sectionStateValueOptions[categoryToSectionStateValueKey[category]]
    };
  };

  const transformOffStageRolesOptions = (
    options: OffStageRoleByCategory
  ): TransformedOffStageRoleByCategory => {
    const transformed: TransformedOffStageRoleByCategory =
      {} as TransformedOffStageRoleByCategory;

    for (const key of Object.keys(options) as OffStageRoleCategory[]) {
      transformed[key] = transformOffStageRoleSection(key, options[key]);
    }

    return transformed;
  };

  const offstageRolesObj = transformOffStageRolesOptions(offstageRolesOptions);

  const isRoleInRolesSection = (section: string[], role: string) =>
    section.indexOf(role) > -1;

  const rolesSectionChange = (
    chkValue: any,
    chk: string,
    fieldName: string,
    section: string[]
  ) => {
    let sectionRoles = [...section];

    if (chkValue) {
      if (sectionRoles.indexOf(chk) < 0) {
        sectionRoles.push(chk);
      }
    } else {
      sectionRoles = sectionRoles.filter((rG) => rG !== chk);
    }

    const target = {
      name: fieldName,
      value: sectionRoles
    };

    setForm({ target });
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>SO, WHAT DO YOU LIKE DOING?</Title>
          <Tagline>Tell us what positions suit you best.</Tagline>
          <TitleThird>Off-Stage Roles</TitleThird>
          <TitleFourth>Select all applicable positions</TitleFourth>
        </Col>
      </Row>
      <Row>
        <Col lg="10">
          <StyledAccordion defaultActiveKey="0">
            {Object.keys(offstageRolesObj).map((objKey, objI) => {
              const currObjKey = (offstageRolesObj as any)[objKey as any];
              const {
                sectionStateValue,
                sectionStateName,
                textHeader,
                checkboxes
              } = currObjKey;

              return (
                <StyledDiv key={`div-accordion-item-${textHeader}`}>
                  <GenericAccordion
                    eventKey={objI}
                    key={`accordion-item-${textHeader}`}
                    textHeader={textHeader}
                  >
                    <Row>
                      <Col lg="7">
                        {checkboxes.map((chk: { label: any; value: any }) => {
                          const { label: chkLabel, value: chkValue } = chk;

                          return (
                            <Checkbox
                              checked={isRoleInRolesSection(
                                sectionStateValue,
                                chk.value
                              )}
                              fieldType="checkbox"
                              key={`${textHeader}-chk-${chkLabel}-${chkValue}`}
                              label={chkLabel}
                              onChange={(e: any) =>
                                rolesSectionChange(
                                  e.currentTarget.checked,
                                  chkValue,
                                  sectionStateName,
                                  sectionStateValue
                                )
                              }
                              value={chkValue}
                            />
                          );
                        })}
                      </Col>
                      <ImageCol lg="4">
                        <Image src={yellow_blob_1} />
                      </ImageCol>
                    </Row>
                  </GenericAccordion>
                </StyledDiv>
              );
            })}
          </StyledAccordion>
        </Col>
      </Row>
    </Container>
  );
};

const TitleThird = styled.h3`
  font-family: ${fonts.mainFont};
  font-size: 20px;
`;

const TitleFourth = styled.h4`
  font-family: ${fonts.lora};
  font-size: 14px;
`;

const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

const StyledAccordion = styled(Accordion)`
  border-radius: 8px;
  opacity: 1;
`;

const StyledDiv = styled.div`
  padding-bottom: 2em;
`;

export default OffstageRoles;
