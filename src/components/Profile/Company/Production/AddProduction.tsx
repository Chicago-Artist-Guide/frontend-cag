import { uuidv4 } from '@firebase/util';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Button } from '../../../../components/shared';
import { useFirebaseContext } from '../../../../context/FirebaseContext';
import { useUserContext } from '../../../../context/UserContext';
import { breakpoints, colors } from '../../../../theme/styleVars';
import { getOptions } from '../../../../utils/helpers';
import {
  productionEquities,
  productionStatuses
} from '../../../../utils/lookups';
import PageContainer from '../../../layout/PageContainer';
import { ImageUploadComponent } from '../../../shared';
import { sanitizeDataForFirestore } from '../../../../utils/firestore';
import {
  FormDateRange,
  FormInput,
  FormRadio,
  FormTextArea
} from '../../Form/Inputs';
import { LeftCol, RightCol, Title } from '../ProfileStyles';
import { Production } from '../types';

// Styled components for better mobile layout
const MobileFormContainer = styled.div`
  @media (max-width: ${breakpoints.md}) {
    padding: 0 10px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.sm}) {
    margin-bottom: 0.75rem;
  }
`;

const DesktopSaveButton = styled(Button)`
  @media (max-width: ${breakpoints.md}) {
    display: none;
  }
`;

const DesktopButtonRow = styled(Row)`
  @media (max-width: ${breakpoints.md}) {
    display: none;
  }
`;

const MobileFooter = styled.div`
  display: none;

  @media (max-width: ${breakpoints.md}) {
    display: block;
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    background: ${colors.white};
    position: sticky;
    bottom: 0;
    z-index: 10;
    margin-top: 32px;
  }
`;

const MobileFooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const MobileButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const MobileButtonCol = styled.div`
  flex: 1;
  display: flex;

  button {
    width: 100%;
    min-height: 44px;
  }
`;

const CompanyAddShow: React.FC<{ toggleEdit: () => void }> = ({
  toggleEdit
}) => {
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    profile: { data: profileData },
    account: { data: accountData }
  } = useUserContext();
  const ownerAccountId = accountData?.uid || profileData?.uid || '';
  const [formValues, setFormValues] = useForm<Production>({
    account_id: ownerAccountId,
    production_id: '',
    production_name: '',
    production_image_url: '',
    type: undefined,
    type_other: '',
    status: undefined,
    description: '',
    director: '',
    musical_director: '',
    choreographer: '',
    other_personnel: '',
    casting_director: '',
    casting_director_email: '',
    equity: undefined,
    roles: [],
    writers: '',
    location: '',
    audition_location: '',
    contact_person_name_offstage: '',
    contact_person_email_offstage: '',
    additional_notes_offstage: '',
    contact_person_name_audition: '',
    contact_person_email_audition: '',
    materials_to_prepare_audition: '',
    additional_notes_audition: ''
  });
  const [_showOtherType, setShowOtherType] = useState(false);

  useEffect(() => {
    setShowOtherType(formValues.type === 'Other');
  }, [formValues.type]);

  console.log(profileData);

  const setProfilePicture = (url: string) => {
    const target = { name: 'production_image_url', value: url };
    setFormValues({ target });
  };

  const handleSubmit = async () => {
    const productionId = uuidv4();
    try {
      const payload = sanitizeDataForFirestore({
        ...formValues,
        production_id: productionId,
        account_id: formValues.account_id || ownerAccountId
      });

      await setDoc(doc(db, 'productions', productionId), payload);
      toggleEdit();
      console.log(productionId);
    } catch (error) {
      console.error('Error creating production:', error);
    }
  };

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-start flex-column flex-md-row">
              <Title>Add a new show</Title>
              <DesktopSaveButton
                onClick={handleSubmit}
                text="Save Show"
                icon={faFloppyDisk}
                type="button"
                variant="primary"
                className="mt-md-0 mt-3"
              />
            </div>
          </Col>
        </Row>
        <MobileFormContainer>
          <Row>
            <LeftCol xs={12} lg={4}>
              <FormSection>
                <ImageUploadComponent
                  imageType="poster"
                  onSave={(production_image_url: string) =>
                    setProfilePicture(production_image_url)
                  }
                  currentImageUrl={formValues?.production_image_url}
                  showCrop={true}
                  maxSizeInMB={5}
                />
              </FormSection>
            </LeftCol>
            <RightCol xs={12} lg={{ span: 7, offset: 1 }}>
              <FormSection>
                <FormInput
                  name="production_name"
                  label="Production Name"
                  onChange={setFormValues}
                  defaultValue={formValues?.production_name}
                  style={{ marginBottom: 20 }}
                />
              </FormSection>
              <FormSection>
                <FormInput
                  name="writers"
                  label="Written By"
                  onChange={setFormValues}
                  defaultValue={formValues?.writers}
                  style={{ marginTop: 0 }}
                />
              </FormSection>
              <FormSection>
                <FormDateRange
                  name="open_and_close"
                  label="Open & Close"
                  onChange={setFormValues}
                  startValue={formValues?.open_and_close_start}
                  endValue={formValues?.open_and_close_end}
                />
              </FormSection>
              <FormSection>
                <FormRadio
                  name="status"
                  label="Status"
                  options={getOptions(productionStatuses)}
                  checked={formValues.status}
                  onChange={setFormValues}
                />
              </FormSection>
              <FormSection>
                <FormTextArea
                  name="description"
                  label="Description"
                  onChange={setFormValues}
                  defaultValue={formValues?.description}
                />
              </FormSection>
              <FormSection>
                <FormInput
                  name="location"
                  label="Location"
                  placeholder="e.g., 123 Main St, Chicago, IL 60601"
                  onChange={setFormValues}
                  defaultValue={formValues?.location}
                />
              </FormSection>
              <FormSection>
                <FormRadio
                  name="equity"
                  label="Equity"
                  options={getOptions(productionEquities)}
                  checked={formValues.equity}
                  onChange={setFormValues}
                />
              </FormSection>
              {/* Personnel Section */}
              <FormSection>
                <div style={{ marginTop: 30, marginBottom: 20 }}>
                  <h5
                    style={{
                      color: '#537C8C',
                      fontFamily: '"Lora", serif',
                      fontStyle: 'italic',
                      marginBottom: 20
                    }}
                  >
                    Show Personnel
                  </h5>
                </div>
                <FormInput
                  name="director"
                  label="Director"
                  onChange={setFormValues}
                  defaultValue={formValues?.director}
                />
                <FormInput
                  name="musical_director"
                  label="Musical Director"
                  onChange={setFormValues}
                  defaultValue={formValues?.musical_director}
                />
                <FormInput
                  name="choreographer"
                  label="Choreographer"
                  onChange={setFormValues}
                  defaultValue={formValues?.choreographer}
                />
                <FormInput
                  name="other_personnel"
                  label="Other"
                  onChange={setFormValues}
                  defaultValue={formValues?.other_personnel}
                />
              </FormSection>
            </RightCol>
          </Row>
        </MobileFormContainer>
        <DesktopButtonRow>
          <Col xs={12} style={{ marginTop: 20 }}>
            <div className="d-flex justify-content-between flex-column flex-sm-row">
              <Button
                onClick={toggleEdit}
                text="Cancel"
                type="button"
                variant="danger"
                className="mb-sm-0 mb-2"
              />
              <Button
                onClick={handleSubmit}
                text="Save Show"
                icon={faFloppyDisk}
                type="button"
                variant="primary"
              />
            </div>
          </Col>
        </DesktopButtonRow>
        <MobileFooter>
          <MobileFooterContent>
            <MobileButtonSection>
              <MobileButtonCol>
                <Button
                  onClick={toggleEdit}
                  text="Cancel"
                  type="button"
                  variant="danger"
                />
              </MobileButtonCol>
              <MobileButtonCol>
                <Button
                  onClick={handleSubmit}
                  text="Save Show"
                  icon={faFloppyDisk}
                  type="button"
                  variant="primary"
                />
              </MobileButtonCol>
            </MobileButtonSection>
          </MobileFooterContent>
        </MobileFooter>
      </Form>
    </PageContainer>
  );
};

export default CompanyAddShow;
