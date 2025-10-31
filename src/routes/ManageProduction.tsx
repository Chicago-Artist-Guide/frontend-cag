import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form, Tab, Tabs } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import ConfirmDialog from '../components/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import ManageProductionBasic from '../components/Profile/Company/Production/Manage/ManageProductionBasic';
import ManageProductionMatches from '../components/Profile/Company/Production/Manage/ManageProductionMatches';
import ManageProductionRoles from '../components/Profile/Company/Production/Manage/ManageProductionRoles';
import { Title } from '../components/Profile/Company/ProfileStyles';
import { Production } from '../components/Profile/Company/types';
import { Button } from '../components/shared';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';
import { colors, fonts } from '../theme/styleVars';
import ManageAuditionInfo from '../components/Profile/Company/Production/Manage/ManageAuditionInfo';
import ManageOffStageInfo from '../components/Profile/Company/Production/Manage/ManageOffStageInfo';
import { sanitizeDataForFirestore } from '../utils/firestore';

const ManageProduction = () => {
  const { productionId = '' } = useParams<{ productionId: string }>();
  const navigate = useNavigate();
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    account: { data: accountData }
  } = useUserContext();
  const ownerAccountId = accountData?.uid || accountData?.account_id || '';
  const [showConfirm, setShowConfirm] = useState(false);
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
    casting_director: '',
    casting_director_email: '',
    equity: undefined,
    writers: '',
    roles: [],
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

  useEffect(() => {
    if (!productionId) {
      console.log('No production ID provided');
      goToProfile();
      return;
    }

    getProduction();
  }, [productionId]);

  const getProduction = async () => {
    const docRef = doc(db, 'productions', productionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Production;
      Object.entries(data).forEach(([key, value]) =>
        setFormValues({
          target: {
            name: key,
            value: value
          }
        })
      );

      if (!data.production_id) {
        setFormValues({
          target: {
            name: 'production_id',
            value: productionId
          }
        });
      }

      if (!data.account_id && ownerAccountId) {
        setFormValues({
          target: {
            name: 'account_id',
            value: ownerAccountId
          }
        });
      }
    } else {
      console.log('No such document!');
      goToProfile();
    }
  };

  const handleUpdateDocument = async (values: Production) => {
    const docRef = doc(db, 'productions', productionId);
    const payload = sanitizeDataForFirestore({
      ...values,
      production_id: values.production_id || productionId,
      account_id: values.account_id || ownerAccountId
    });

    await updateDoc(docRef, payload);
  };

  const handleSave = async () => {
    try {
      await handleUpdateDocument(formValues);
      goToProfile();
    } catch (error) {
      console.error('Error saving production:', error);
    }
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const onDeleteConfirm = async () => {
    try {
      const docRef = doc(db, 'productions', productionId);
      await deleteDoc(docRef);
      goToProfile();
    } catch (error) {
      console.error('Error deleting production:', error);
    }
  };

  const onDeleteCancel = () => {
    setShowConfirm(false);
  };

  return (
    <PageContainer>
      <ConfirmDialog
        title="Delete show"
        content="Are you sure you wish to delete this production?"
        onCancel={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        show={showConfirm}
      />
      <Form>
        <Row>
          <Col lg={12}>
            <div className="d-flex justify-content-between flex-row">
              <Title>Manage Production</Title>
              <Button
                onClick={handleSave}
                text="Save Show"
                icon={faFloppyDisk}
                type="button"
                variant="primary"
              />
            </div>
          </Col>
        </Row>

        <ProductionTabs
          defaultActiveKey="basic"
          id="manage-production"
          className="mb-3"
        >
          <Tab eventKey="basic" title="Basic Info">
            <TabRow>
              <ManageProductionBasic
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </TabRow>
          </Tab>
          <Tab eventKey="roles" title="Roles">
            <TabRow>
              <ManageProductionRoles
                formValues={formValues}
                setFormValues={setFormValues}
                handleUpdate={handleUpdateDocument}
              />
            </TabRow>
          </Tab>
          <Tab eventKey="audition" title="Audition Info">
            <TabRow>
              <ManageAuditionInfo
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </TabRow>
          </Tab>
          <Tab eventKey="hiring" title="Off-Stage Hiring Info">
            <TabRow>
              <ManageOffStageInfo
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </TabRow>
          </Tab>
          <Tab eventKey="matches" title="Matches">
            <TabRow>
              <ManageProductionMatches
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </TabRow>
          </Tab>
        </ProductionTabs>

        <Row>
          <Col lg={12} style={{ marginTop: 20 }}>
            <div className="d-flex justify-content-between flex-row">
              <Button
                onClick={goToProfile}
                text="Cancel"
                type="button"
                variant="danger"
              />
              <div className="d-flex flex-row">
                <Button
                  onClick={() => setShowConfirm(true)}
                  text="Delete"
                  type="button"
                  variant="danger"
                  className="mr-3"
                />
                <Button
                  onClick={handleSave}
                  text="Save Show"
                  icon={faFloppyDisk}
                  type="button"
                  variant="primary"
                />
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </PageContainer>
  );
};

const TabRow = styled(Row)`
  padding-top: 40px;
  padding-bottom: 40px;
`;

const ProductionTabs = styled(Tabs)`
  border-bottom: 1px solid ${colors.paginationGray};
  li {
    font-family: ${fonts.montserrat};
    font-style: normal;
    font-size: 18px;
    line-height: 20px;
    letter-spacing: 0.07em;
    color: ${colors.mainFont};
    margin-right: 20px;
  }
  &.nav-tabs .nav-link {
    font-weight: 500;
    border: none;
    background-color: transparent;
    border-color: none;
  }
  &.nav-tabs .nav-link.active {
    font-weight: 700;
    border: none;
    background-color: transparent;
    border-color: none;
    border-bottom: 4px solid ${colors.peach};
  }
`;

export default ManageProduction;
