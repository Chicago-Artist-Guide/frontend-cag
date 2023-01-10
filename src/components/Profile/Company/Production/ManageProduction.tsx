import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form, Nav, Tab, Tabs } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useFirebaseContext } from '../../../../context/FirebaseContext';
import { useProfileContext } from '../../../../context/ProfileContext';
import { Button } from '../../../../genericComponents';
import { colors, fonts } from '../../../../theme/styleVars';
import PageContainer from '../../../layout/PageContainer';

import { Title } from '../ProfileStyles';
import { Production } from '../types';
import ManageProductionBasic from './ManageProductionBasic';
import ManageProductionDates from './ManageProductionDates';
import ManageProductionMatches from './ManageProductionMatches';
import ManageProductionRoles from './ManageProductionRoles';

const ManageProduction: React.FC<null> = () => {
  const { productionId } = useParams();
  const history = useHistory();
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    account: { data: accountData }
  } = useProfileContext();
  const [formValues, setFormValues] = useForm<Production>({
    account_id: accountData?.account_id,
    production_id: '',
    production_name: '',
    production_image_url: '',
    type: undefined,
    type_other: '',
    status: undefined,
    description: '',
    director: '',
    musical_director: '',
    equity: undefined,
    writers: ''
  });

  useEffect(() => {
    getProduction();
  }, [productionId]);

  const getProduction = async () => {
    const docRef = doc(db, 'productions', productionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
      const data = docSnap.data() as Production;
      Object.entries(data).map(([key, value]) =>
        setFormValues({
          target: {
            name: key,
            value: value
          }
        })
      );
    } else {
      console.log('No such document!');
      goToProfile();
    }
  };

  const handleSubmit = async () => {
    const docRef = doc(db, 'productions', productionId);
    await updateDoc(docRef, formValues);
    goToProfile();
  };

  const goToProfile = () => {
    history.push('/profile');
  };

  // console.log('formValues', formValues);

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col lg={12}>
            <div className="d-flex flex-row justify-content-between">
              <Title>Manage Production</Title>
              <Button
                onClick={handleSubmit}
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
          <Tab eventKey="dates" title="Important Dates">
            <TabRow>
              <ManageProductionDates
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
            <div className="d-flex flex-row justify-content-between">
              <Button
                onClick={goToProfile}
                text="Cancel"
                type="button"
                variant="danger"
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
  border-bottom: 1px solid #d4d6df;
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
