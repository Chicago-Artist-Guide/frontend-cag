import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { Button, Checkbox } from '../../../components/shared';
import { colors, fonts, breakpoints } from '../../../theme/styleVars';
import {
  AgeRange,
  ageRanges,
  ethnicityTypes,
  genders,
  IndividualProfileDataFull,
  IndividualWebsite,
  websiteTypeOptions
} from '../../SignUp/Individual/types';

interface EditPersonalDetailsProps<T extends keyof IndividualWebsite> {
  ageRangeChange: (checkValue: boolean, range: AgeRange) => void;
  editProfile: IndividualProfileDataFull;
  onWebsiteInputChange: (
    fieldValue: IndividualWebsite[T],
    fieldName: T,
    id: number
  ) => void;
  removeWebsiteInput: (e: any, id: any) => void;
  addWebsiteInput: (e: any) => void;
  updatePersonalDetails: () => Promise<void>;
  setProfileForm: (field: string, value: any) => void;
  ethnicityChange: (checkValue: any, type: string) => void;
}

const EditPersonalDetails = ({
  ageRangeChange,
  editProfile,
  onWebsiteInputChange,
  removeWebsiteInput,
  addWebsiteInput,
  updatePersonalDetails,
  setProfileForm,
  ethnicityChange
}: EditPersonalDetailsProps<any>) => {
  return (
    <div>
      <Form.Group className="form-group">
        <CAGLabel>Which age ranges do you play?</CAGLabel>
        <p>Select up to 3 ranges</p>
        {ageRanges.map((ageRange) => (
          <Checkbox
            checked={editProfile?.age_ranges?.includes(ageRange)}
            fieldType="checkbox"
            key={`age-range-chk-${ageRange}`}
            label={ageRange}
            name="actorInfo2AgeRanges"
            onChange={(e: any) =>
              ageRangeChange(e.currentTarget.checked, ageRange)
            }
          />
        ))}
      </Form.Group>
      <Form.Group className="form-group">
        <CAGLabel>Height</CAGLabel>
        <Container>
          <Row>
            <PaddedCol lg="6" xs="12">
              <Form.Control
                aria-label="height feet"
                as="select"
                value={editProfile?.height_ft}
                name="actorInfo2HeightFt"
                onChange={(e: any) =>
                  setProfileForm('height_ft', e.target.value)
                }
              >
                <option value={undefined}>Feet</option>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((ft) => (
                  <option key={`ft-option-value-${ft}`} value={ft}>
                    {ft} ft
                  </option>
                ))}
              </Form.Control>
            </PaddedCol>
            <PaddedCol lg="6" xs="12">
              <Form.Control
                aria-label="height inches"
                as="select"
                value={editProfile?.height_in}
                name="actorInfo2HeightIn"
                onChange={(e: any) =>
                  setProfileForm('height_in', e.target.value)
                }
              >
                <option value={undefined}>Inches</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inches) => (
                  <option key={`inch-option-value-${inches}`} value={inches}>
                    {inches} in
                  </option>
                ))}
              </Form.Control>
            </PaddedCol>
          </Row>
          <Row>
            <PaddedCol lg="12">
              <Checkbox
                checked={editProfile?.height_no_answer}
                fieldType="checkbox"
                label="I do not wish to answer"
                name="actorInfo2HeightNoAnswer"
                onChange={(e: any) =>
                  setProfileForm('height_no_answer', e.currentTarget.checked)
                }
              />
            </PaddedCol>
          </Row>
        </Container>
      </Form.Group>
      <Form.Group className="form-group">
        <CAGLabel>Gender Identity</CAGLabel>
        <p>
          First, choose your gender identity - additional options may be
          presented for casting purposes. If other, please select the option
          with which you most closely identify for casting purposes.
        </p>
        <Form.Control
          as="select"
          value={editProfile?.gender_identity}
          name="actorInfo2Gender"
          onChange={(e: any) =>
            setProfileForm('gender_identity', e.target.value)
          }
        >
          <option value={undefined}>Select</option>
          {genders.map((g) => (
            <option key={`gender-value-${g}`} value={g}>
              {g}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="form-group">
        <CAGLabel>Ethnicity</CAGLabel>
        {ethnicityTypes.map((eth) => (
          <React.Fragment key={`parent-frag-chk-${eth.name}`}>
            <Checkbox
              checked={editProfile?.ethnicities.includes(eth.name)}
              fieldType="checkbox"
              key={`first-level-chk-${eth.name}`}
              label={eth.name}
              name="actorInfo1Ethnicities"
              onChange={(e: any) =>
                ethnicityChange(e.currentTarget.checked, eth.name)
              }
            />
            {eth.values.length > 0 && (
              <Checkbox style={{ paddingLeft: '1.25rem' }}>
                {eth.values.map((ethV) => (
                  <Checkbox
                    checked={editProfile?.ethnicities.includes(ethV)}
                    fieldType="checkbox"
                    key={`${eth.name}-child-chk-${ethV}`}
                    label={ethV}
                    name="actorInfoEthnicities"
                    onChange={(e: any) =>
                      ethnicityChange(e.currentTarget.checked, ethV)
                    }
                  />
                ))}
              </Checkbox>
            )}
          </React.Fragment>
        ))}
      </Form.Group>
      <Form.Group>
        <CAGLabel>Union</CAGLabel>
        <Container>
          <Row>
            <PaddedCol lg="5" xs="12">
              <CAGFormControl
                aria-label="union"
                as="select"
                name="demographicsUnionStatus"
                value={editProfile?.union_status}
                onChange={(e: any) =>
                  setProfileForm('union_status', e.target.value)
                }
              >
                <option value={undefined}>Select union status</option>
                <option value="Union">Union</option>
                <option value="Non-Union">Non-Union</option>
                <option value="Other">Other</option>
              </CAGFormControl>
            </PaddedCol>
            <PaddedCol lg="5" xs="12">
              <CAGFormControl
                aria-label="union"
                defaultValue={editProfile?.union_other}
                disabled={false}
                name="demographicsUnionStatusOther"
                onChange={(e: any) =>
                  setProfileForm('union_other', e.target.value)
                }
                placeholder="Other"
              />
            </PaddedCol>
          </Row>
        </Container>
        <CAGLabel>Agency</CAGLabel>
        <Container>
          <Row>
            <PaddedCol lg="10">
              <Form.Group className="form-group">
                <CAGFormControl
                  aria-label="agency"
                  defaultValue={editProfile?.agency}
                  name="demographicsAgency"
                  onChange={(e: any) =>
                    setProfileForm('agency', e.target.value)
                  }
                  placeholder="Agency"
                />
              </Form.Group>
            </PaddedCol>
          </Row>
        </Container>
      </Form.Group>
      <hr />
      <Form.Group>
        <CAGLabel>Website Links</CAGLabel>
        <Container>
          <Row>
            <PaddedCol lg="10">
              {editProfile?.websites?.map((websiteRow: any) => (
                <div key={`website-row-${websiteRow.id}`}>
                  <CAGFormControl
                    aria-label="URL"
                    as="input"
                    name="websiteUrl"
                    onChange={(e: any) =>
                      onWebsiteInputChange(
                        e.target.value || '',
                        'url',
                        websiteRow.id
                      )
                    }
                    placeholder="URL"
                    value={websiteRow.url}
                  />
                  <CAGFormControl
                    aria-label="website type"
                    as="select"
                    defaultValue={websiteRow.websiteType}
                    name="websiteType"
                    onChange={(e: any) =>
                      onWebsiteInputChange(
                        e.target.value || '',
                        'websiteType',
                        websiteRow.id
                      )
                    }
                  >
                    <option value={undefined}>Select Type</option>
                    {websiteTypeOptions.map((wT) => (
                      <option value={wT} key={wT}>
                        {wT}
                      </option>
                    ))}
                  </CAGFormControl>
                  {editProfile.websites.length > 1 && (
                    <DeleteLink
                      href="#"
                      onClick={(e: any) => removeWebsiteInput(e, websiteRow.id)}
                    >
                      X Delete
                    </DeleteLink>
                  )}
                </div>
              ))}
              <div>
                <AddLink href="#" onClick={addWebsiteInput}>
                  + Add Website
                </AddLink>
              </div>
            </PaddedCol>
          </Row>
        </Container>
      </Form.Group>
      <ButtonContainer>
        <Button
          onClick={updatePersonalDetails}
          text="Save"
          type="button"
          variant="primary"
        />
      </ButtonContainer>
    </div>
  );
};

const CAGFormControl = styled(Form.Control)`
  margin-bottom: 1em;
  border: 1px solid ${colors.lightGrey};
  border-radius: 7px;
  font-family: ${fonts.mainFont};
  padding: 5px;
  padding-left: 10px;
  width: 100%;

  @media (max-width: ${breakpoints.md}) {
    padding: 10px;
    padding-left: 12px;
    font-size: 16px;
  }
`;

const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;

  @media (max-width: ${breakpoints.md}) {
    font-size: 16px;
  }
`;

const PaddedCol = styled(Col)`
  padding-left: 0;
`;

const DeleteLink = styled.a`
  color: ${colors.salmon};
  display: inline-block;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  margin-top: 0.5em;
  font-weight: 500;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: ${breakpoints.md}) {
    font-size: 16px;
  }
`;

const AddLink = styled.a`
  color: ${colors.primary};
  display: inline-block;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  margin-top: 1em;
  font-weight: 500;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: ${breakpoints.md}) {
    font-size: 16px;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 24px;

  @media (max-width: ${breakpoints.md}) {
    margin-top: 20px;

    button {
      width: 100%;
      min-height: 44px;
    }
  }
`;

export default EditPersonalDetails;
