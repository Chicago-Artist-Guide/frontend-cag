import React, { useState } from 'react';
import styled from 'styled-components';
import { Container } from 'styled-bootstrap-grid';
import { hasNonEmptyValues } from '../../../../../utils/hasNonEmptyValues';
import { offstageRolesOptions } from '../../../shared/offstageRolesOptions';
import { Checkbox, Button } from '../../../../../genericComponents';

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
}

const OffStageSkillsEdit: React.FC<PropType> = ({
  offstage_roles_general,
  offstage_roles_production,
  offstage_roles_scenic_and_properties,
  offstage_roles_lighting,
  offstage_roles_sound,
  offstage_roles_hair_makeup_costumes,
  submitOffStageSkills
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
        <div key={section.key}>
          <Bold>{section.name}</Bold>
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
        </div>
      ))}
      <Button
        onClick={handleSubmit}
        text="Save"
        type="button"
        variant="primary"
      />
    </Container>
  );
};

const Bold = styled.p`
  font-weight: 500;
  font-size: 20px;
  margin-top: 25px;
`;

export default OffStageSkillsEdit;
