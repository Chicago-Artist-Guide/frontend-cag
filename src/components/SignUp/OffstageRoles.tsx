import React from 'react';
import styled from 'styled-components';
import { fonts } from '../../theme/styleVars';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import { Tagline, Title } from '../layout/Titles';
import GenericAccordion from '../../genericComponents/GenericAccordion';
import Checkbox from '../../genericComponents/Checkbox';
import yellow_blob_1 from '../../images/yellow_blob_1.svg';

const OffstageRoles: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { formData, setForm } = props;

  const {
    offstageRolesGeneral,
    offstageRolesProduction,
    offstageRolesScenicAndProperties,
    offstageRolesLighting,
    offstageRolesSound,
    offstageRolesHairMakeupCostumes
  } = formData;

  const offstageRolesObj = {
    general: {
      sectionStateValue: offstageRolesGeneral,
      sectionStateName: 'offstageRolesGeneral',
      textHeader: 'General',
      checkboxes: [
        {
          label: 'Directing',
          value: 'Directing'
        },
        {
          label: 'Violence / Fight Design',
          value: 'Violence / Fight Design'
        },
        {
          label: 'Intimacy Design',
          value: 'Intimacy Design'
        },
        {
          label: 'Choreography',
          value: 'Choreography'
        },
        {
          label: 'Casting',
          value: 'Casting'
        },
        {
          label: 'Dramaturgy',
          value: 'Dramaturgy'
        },
        {
          label: 'Dialect Coaching',
          value: 'Dialect Coaching'
        },
        {
          label: 'Musical Directing',
          value: 'Musical Directing'
        }
      ]
    },
    production: {
      sectionStateValue: offstageRolesProduction,
      sectionStateName: 'offstageRolesProduction',
      textHeader: 'Production',
      checkboxes: [
        {
          label: 'Stage Management',
          value: 'Stage Management'
        },
        {
          label: 'Production Management',
          value: 'Production Management'
        },
        {
          label: 'Board Op',
          value: 'Board Op'
        },
        {
          label: 'Run Crew',
          value: 'Run Crew'
        }
      ]
    },
    scenicAndProperties: {
      sectionStateValue: offstageRolesScenicAndProperties,
      sectionStateName: 'offstageRolesScenicAndProperties',
      textHeader: 'Scenic & Properties',
      checkboxes: [
        {
          label: 'Set Design',
          value: 'Set Design'
        },
        {
          label: 'Technical Direction',
          value: 'Technical Direction'
        },
        {
          label: 'Properties Designer',
          value: 'Properties Designer'
        },
        {
          label: 'Scenic Carpentry',
          value: 'Scenic Carpentry'
        },
        {
          label: 'Charge Artist',
          value: 'Charge Artist'
        }
      ]
    },
    lighting: {
      sectionStateValue: offstageRolesLighting,
      sectionStateName: 'offstageRolesLighting',
      textHeader: 'Lighting',
      checkboxes: [
        {
          label: 'Lighting Design',
          value: 'Lighting Design'
        },
        {
          label: 'Projection Design',
          value: 'Projection Design'
        },
        {
          label: 'Special Effect Design',
          value: 'Special Effect Design'
        },
        {
          label: 'Master Electrician',
          value: 'Master Electrician'
        }
      ]
    },
    sound: {
      sectionStateValue: offstageRolesSound,
      sectionStateName: 'offstageRolesSound',
      textHeader: 'Sound',
      checkboxes: [
        {
          label: 'Sound Design',
          value: 'Sound Design'
        },
        {
          label: 'Sound Mixer / Engineer',
          value: 'Sound Mixer / Engineer'
        }
      ]
    },
    hairMakeupCostumes: {
      sectionStateValue: offstageRolesHairMakeupCostumes,
      sectionStateName: 'offstageRolesHairMakeupCostumes',
      textHeader: 'Hair, Makeup, Costumes',
      checkboxes: [
        {
          label: 'Costume Design',
          value: 'Costume Design'
        },
        {
          label: 'Hair & Wig Design',
          value: 'Hair & Wig Design'
        },
        {
          label: 'Make-up Design',
          value: 'Make-up Design'
        }
      ]
    }
  };

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
      sectionRoles = sectionRoles.filter(rG => rG !== chk);
    }

    const target = {
      name: 'offstageRolesGeneral',
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
      {Object.keys(offstageRolesObj).map(objKey => {
        const currObjKey = (offstageRolesObj as any)[objKey as any];
        const {
          sectionStateValue,
          sectionStateName,
          textHeader,
          role,
          checkboxes
        } = currObjKey;

        return (
          <Row key={`accordion-row-${textHeader}`}>
            <Col lg="10">
              <GenericAccordion
                key={`accordion-${textHeader}`}
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
                              role,
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
            </Col>
          </Row>
        );
      })}
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

export default OffstageRoles;
