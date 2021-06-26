import React from 'react';
// import { colors } from '../../theme/styleVars';
// import styled from 'styled-components';
import GenericAccordion from '../../genericComponents/Accordion';
import Checkbox from '../../genericComponents/Accordion';

const OffstageRoles = (...props: any) => {

  const offstageRolesObj = {
    general: {
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
      textHeader: 'Production',
      checkboxes: [
        {
          label: 'Stage Management',
          value: 'the-checkbox-name'
        },
        {
          label: 'Production Management',
          value: 'the-checkbox-name'
        },
        {
          label: 'Board Op',
          value: 'the-checkbox-name'
        },
        {
          label: 'Run Crew',
          value: 'the-checkbox-name'
        }
      ]
    },
    scenicAndProperties: {
      textHeader: 'Scenic & Properties',
      checkboxes: [
        {
          label: 'Set Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Technical Direction',
          value: 'the-checkbox-name'
        },
        {
          label: 'Properties Designer',
          value: 'the-checkbox-name'
        },
        {
          label: 'Scenic Carpentry',
          value: 'the-checkbox-name'
        },
        {
          label: 'Charge Artist',
          value: 'the-checkbox-name'
        },
      ]
    },
    lighting: {
      textHeader: 'Lighting',
      checkboxes: [
        {
          label: 'Lighting Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Projection Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Special Effect Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Master Electrician',
          value: 'the-checkbox-name'
        },
      ]
    },
    sound: {
      textHeader: 'Sound',
      checkboxes: [
        {
          label: 'Sound Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Sound Mixer / Engineer',
          value: 'the-checkbox-name'
        }
      ]
    },
    hairMakeupCostumes: {
      textHeader: 'Hair, Makeup, Costumes',
      checkboxes: [
        {
          label: 'Costume Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Hair & Wig Design',
          value: 'the-checkbox-name'
        },
        {
          label: 'Make-up Design',
          value: 'the-checkbox-name'
        },
      ]
    }
  };

  return(
    <div>
      <h1>SO, WHAT DO YOU LIKE DOING?</h1>
      <h2>Tell us what positions suit you best.</h2>
      <h3>Off-Stage Roles</h3>
      <h4>Select all applicable positions</h4>
      
      {Object.keys(offstageRolesObj).map(
        (objKey) => {
          const currObjKey = (offstageRolesObj as any)[objKey as any];
            return <GenericAccordion textHeader={currObjKey.textHeader}>
              <div>abc</div>
              {currObjKey.checkboxes.map(
                (chk: { label: any; value: any; }) => {
                  return <Checkbox fieldType="checkbox" label={chk.label} value={chk.value}/>
                }
              )}
            </GenericAccordion>
          ;
        }
    )
  }
  </div>
  )}

export default OffstageRoles;
