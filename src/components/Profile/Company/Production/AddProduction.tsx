import { uuidv4 } from '@firebase/util';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import { Button } from '../../../../components/shared';
import { useFirebaseContext } from '../../../../context/FirebaseContext';
import { useUserContext } from '../../../../context/UserContext';
import { getOptions } from '../../../../utils/helpers';
import {
  neighborhoods,
  productionEquities,
  productionStatuses
} from '../../../../utils/lookups';
import PageContainer from '../../../layout/PageContainer';
import ImageUpload from '../../../shared/ImageUpload';
import {
  FormDateRange,
  FormInput,
  FormRadio,
  FormSelect,
  FormTextArea
} from '../../Form/Inputs';
import { LeftCol, RightCol, Title } from '../ProfileStyles';
import { Production } from '../types';

const CompanyAddShow: React.FC<{
  toggleEdit: () => void;
}> = ({ toggleEdit }) => {
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    account: { data: accountData }
  } = useUserContext();
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
  const [_showOtherType, setShowOtherType] = useState(false);

  useEffect(() => {
    setShowOtherType(formValues.type === 'Other');
  }, [formValues.type]);

  const setProfilePicture = (url: string) => {
    const target = {
      name: 'production_image_url',
      value: url
    };
    setFormValues({ target });
  };

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
            <div className="d-flex justify-content-between flex-row">
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
            <ImageUpload
              type="Poster"
              onSave={(production_image_url: string) =>
                setProfilePicture(production_image_url)
              }
              currentImgUrl={formValues?.production_image_url}
              modal={false}
            />
          </LeftCol>
          <RightCol lg={{ span: 7, offset: 1 }}>
            <FormInput
              name="production_name"
              label="Production Name"
              onChange={setFormValues}
              defaultValue={formValues?.production_name}
              style={{ marginBottom: 20 }}
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
            <div className="d-flex justify-content-between flex-row">
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

export default CompanyAddShow;
