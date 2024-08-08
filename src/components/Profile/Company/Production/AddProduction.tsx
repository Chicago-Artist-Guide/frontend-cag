import { uuidv4 } from '@firebase/util';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { useFirebaseContext } from '../../../../context/FirebaseContext';
import { useProfileContext } from '../../../../context/ProfileContext';
import { Button } from '../../../../genericComponents';
import { colors, fonts } from '../../../../theme/styleVars';
import { getOptions } from '../../../../utils/helpers';
import {
  neighborhoods,
  productionEquities,
  productionStatuses
} from '../../../../utils/lookups';
import PageContainer from '../../../layout/PageContainer';
import {
  FormDateRange,
  FormInput,
  FormRadio,
  FormTextArea,
  FormSelect
} from '../../Form/Inputs';
import { LeftCol, RightCol, Title } from '../ProfileStyles';
import { Production } from '../types';
import ProductionPhoto from './ProductionPhoto';

const CompanyAddShow: React.FC<{
  toggleEdit: () => void;
}> = ({ toggleEdit }) => {
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    account: { data: accountData }
  } = useProfileContext();
  const [formValues, setFormValues] = useForm<Production>({
    account_id: accountData?.uid,
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
    roles: [],
    writers: '',
    location: ''
  });
  const [showOtherType, setShowOtherType] = useState(false);

  useEffect(() => {
    setShowOtherType(formValues.type === 'Other');
  }, [formValues.type]);

  const handleSubmit = async () => {
    const productionId = uuidv4();
    await setDoc(doc(db, 'productions', productionId), {
      ...formValues,
      production_id: productionId
    });
    toggleEdit();
  };

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col lg={12}>
            <div className="d-flex flex-row justify-content-between">
              <Title>Add a new show</Title>
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
        <Row>
          <LeftCol lg={4}>
            <ProductionPhoto
              src={formValues?.production_image_url}
              name="production_image_url"
              onChange={setFormValues}
            />
          </LeftCol>
          <RightCol lg={{ span: 7, offset: 1 }}>
            <FormInput
              name="production_name"
              label="Production Name"
              onChange={setFormValues}
              defaultValue={formValues?.production_name}
              style={{ marginTop: 20 }}
            />
            <FormInput
              name="writers"
              label="Written By"
              onChange={setFormValues}
              defaultValue={formValues?.writers}
              style={{ marginTop: 0 }}
            />
            <FormDateRange
              name="open_and_close"
              label="Open & Close"
              onChange={setFormValues}
              startValue={formValues?.open_and_close_start}
              endValue={formValues?.open_and_close_end}
            />
            <FormRadio
              name="status"
              label="Status"
              options={getOptions(productionStatuses)}
              checked={formValues.status}
              onChange={setFormValues}
            />
            <FormTextArea
              name="description"
              label="Description"
              onChange={setFormValues}
              defaultValue={formValues?.description}
            />
            <FormInput
              name="director"
              label="Director"
              onChange={setFormValues}
              defaultValue={formValues?.director}
            />
            <FormRadio
              name="equity"
              label="Equity"
              options={getOptions(productionEquities)}
              checked={formValues.equity}
              onChange={setFormValues}
            />
            <FormSelect
              name="location"
              label="Location"
              defaultValue="The Loop"
              options={getOptions(neighborhoods)}
              onChange={setFormValues}
            />
            <FormInput
              name="musical_director"
              label="Musical Director"
              onChange={setFormValues}
              defaultValue={formValues?.musical_director}
            />
          </RightCol>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: 20 }}>
            <div className="d-flex flex-row justify-content-between">
              <Button
                onClick={toggleEdit}
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

const Section = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.07em;
  color: ${colors.mainFont};
  margin-top: 17px;
`;

export default CompanyAddShow;
