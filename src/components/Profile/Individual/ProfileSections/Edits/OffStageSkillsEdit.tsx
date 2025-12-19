import React, { useState } from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { Button, Checkbox } from '../../../../../components/shared';
import { offstageRolesOptions } from '../../../shared/offstageRolesOptions';
import { breakpoints } from '../../../../../theme/styleVars';

interface SelectedRolesType {
  offstage_roles_general: string[];
  offstage_roles_production: string[];
  offstage_roles_scenic_and_properties: string[];
  offstage_roles_lighting: string[];
  offstage_roles_sound: string[];
  offstage_roles_hair_makeup_costumes: string[];
}

interface PropType {
  offstage_roles_general: string[];
  offstage_roles_production: string[];
  offstage_roles_scenic_and_properties: string[];
  offstage_roles_lighting: string[];
  offstage_roles_sound: string[];
  offstage_roles_hair_makeup_costumes: string[];
  submitOffStageSkills: (selectedRoles: any) => void;
  onCancel: () => void;
}

const OffStageSkillsEdit: React.FC<PropType> = ({
  offstage_roles_general,
  offstage_roles_production,
  offstage_roles_scenic_and_properties,
  offstage_roles_lighting,
  offstage_roles_sound,
  offstage_roles_hair_makeup_costumes,
  submitOffStageSkills,
  onCancel
}) => {
  const [selectedRoles, setSelectedRoles] = useState({
    offstage_roles_general: offstage_roles_general || [],
    offstage_roles_production: offstage_roles_production || [],
    offstage_roles_scenic_and_properties:
      offstage_roles_scenic_and_properties || [],
    offstage_roles_lighting: offstage_roles_lighting || [],
    offstage_roles_sound: offstage_roles_sound || [],
    offstage_roles_hair_makeup_costumes:
      offstage_roles_hair_makeup_costumes || []
  });

  const offStageObj = () => {
    const offObj = [];
    for (const [key, value] of Object.entries(offstageRolesOptions)) {
      const name = value.name;
      const options = value.options;
      const roles = options.map((item) => item.value);
      let modifiedKey = key;
      if (key === 'hairMakeupCostumes') {
        modifiedKey = 'hair_makeup_costumes';
      } else if (key === 'scenicAndProperties') {
        modifiedKey = 'scenic_and_properties';
      }
      const section = {
        name: name,
        roles: roles,
        key: 'offstage_roles_'.concat(modifiedKey)
      };
      offObj.push(section);
    }
    return offObj;
  };

  const roleIsSelected = (value: string, key: string) => {
    const targetArray = selectedRoles[key as keyof SelectedRolesType] || [];
    return targetArray.includes(value);
  };

  const handleRoleSelection = (role: string, key: string) => {
    setSelectedRoles((prevRoles) => {
      const updatedRoles = { ...prevRoles };
      const targetArray = updatedRoles[key as keyof SelectedRolesType];

      if (targetArray) {
        if (targetArray.includes(role)) {
          updatedRoles[key as keyof SelectedRolesType] = targetArray.filter(
            (item) => item !== role
          );
        } else {
          updatedRoles[key as keyof SelectedRolesType] = [...targetArray, role];
        }
      }

      return updatedRoles;
    });
  };

  const data = offStageObj();

  const handleSubmit = () => {
    submitOffStageSkills(selectedRoles);
  };

  return (
    <Container>
      {data.map((section) => (
        <SectionContainer key={section.key}>
          <Bold>{section.name}</Bold>
          <CheckboxContainer>
            {section.roles.map((role) => (
              <Checkbox
                checked={roleIsSelected(role, section.key)}
                fieldType="checkbox"
                key={role}
                label={role}
                value={role}
                onChange={() => handleRoleSelection(role, section.key)}
              />
            ))}
          </CheckboxContainer>
        </SectionContainer>
      ))}
      <ButtonContainer>
        <Button
          onClick={handleSubmit}
          text="Save"
          type="button"
          variant="primary"
        />
        <Button
          onClick={onCancel}
          text="Cancel"
          type="button"
          variant="secondary"
        />
      </ButtonContainer>
    </Container>
  );
};

const Bold = styled.p`
  font-weight: 500;
  font-size: 20px;
  margin-top: 25px;

  @media (max-width: ${breakpoints.md}) {
    font-size: 18px;
    margin-top: 20px;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 24px;

  @media (max-width: ${breakpoints.md}) {
    margin-bottom: 20px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: ${breakpoints.md}) {
    gap: 8px;
    margin-top: 10px;

    label {
      min-height: 44px;
      display: flex;
      align-items: center;
      padding: 8px 12px;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;

  @media (max-width: ${breakpoints.md}) {
    flex-direction: column;
    margin-top: 20px;
    gap: 8px;

    button {
      width: 100%;
      min-height: 44px;
    }
  }
`;

export default OffStageSkillsEdit;
