import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EditPersonalDetails from './EditPersonalDetails';
import type { IndividualProfileDataFull } from '../../SignUp/Individual/types';

const baseProfile = {
  age_ranges: [],
  gender_identity: 'Trans/Nonbinary',
  gender_roles: ['Woman'],
  ethnicities: [],
  lgbtqia: '',
  height_ft: 0,
  height_in: 0,
  height_no_answer: false,
  union_status: ['Non-Union'],
  agency: '',
  websites: [{ id: 1, url: '', websiteType: '' as const }]
} as IndividualProfileDataFull;

const renderEditPersonalDetails = (
  overrides: Partial<IndividualProfileDataFull> = {},
  handlers: Partial<{
    genderIdentityChange: ReturnType<typeof vi.fn>;
    genderRoleChange: ReturnType<typeof vi.fn>;
  }> = {}
) => {
  const genderIdentityChange = handlers.genderIdentityChange ?? vi.fn();
  const genderRoleChange = handlers.genderRoleChange ?? vi.fn();

  render(
    <EditPersonalDetails
      ageRangeChange={vi.fn()}
      editProfile={{ ...baseProfile, ...overrides }}
      genderIdentityChange={genderIdentityChange}
      genderRoleChange={genderRoleChange}
      onWebsiteInputChange={vi.fn()}
      removeWebsiteInput={vi.fn()}
      addWebsiteInput={vi.fn()}
      updatePersonalDetails={vi.fn()}
      setProfileForm={vi.fn()}
      ethnicityChange={vi.fn()}
    />
  );

  return { genderIdentityChange, genderRoleChange };
};

describe('EditPersonalDetails gender role editing', () => {
  it('shows on-stage gender role checkboxes for Trans/Nonbinary users', () => {
    renderEditPersonalDetails();

    expect(
      screen.getByText(
        /Which on-stage role genders do you want to be matched with/i
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Woman')).toBeChecked();
    expect(screen.getByLabelText('Man')).not.toBeChecked();
    expect(screen.getByLabelText('Nonbinary')).not.toBeChecked();
  });

  it('forwards gender role checkbox changes to the parent handler', async () => {
    const user = userEvent.setup();
    const { genderRoleChange } = renderEditPersonalDetails();

    await user.click(screen.getByLabelText('Man'));

    expect(genderRoleChange).toHaveBeenCalledWith(true, 'Man');
  });

  it('hides gender role checkboxes when gender identity is not Trans/Nonbinary', () => {
    renderEditPersonalDetails({
      gender_identity: 'Cis Woman',
      gender_roles: []
    });

    expect(
      screen.queryByText(
        /Which on-stage role genders do you want to be matched with/i
      )
    ).not.toBeInTheDocument();
  });
});
