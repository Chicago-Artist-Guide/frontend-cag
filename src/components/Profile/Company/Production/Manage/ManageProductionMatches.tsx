import React from 'react';
import { Col } from 'react-bootstrap';
import { Production } from '../../types';

const ManageProductionMatches: React.FC<
  React.PropsWithChildren<{
    formValues: Production;
    setFormValues: any;
  }>
> = () => {
  return <Col>Matches</Col>;
};

export default ManageProductionMatches;
