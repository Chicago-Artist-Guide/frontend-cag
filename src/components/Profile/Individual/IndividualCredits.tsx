import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { PastPerformances } from '../../SignUp/Individual/types';
import {
  ShowCard,
  ShowName,
  ShowDescription,
  ShowStatus as ShowDates
} from '../Company/Production/ActiveProduction';

const IndividualCredits: React.FC<{
  show: PastPerformances;
}> = ({ show }) => {
  return (
    <ShowCard>
      <Row>
        <Col lg={6}>
          <ShowName>{show?.title}</ShowName>
          <ShowDates>
            ({show?.startDate} - {show?.endDate})
          </ShowDates>
          <ShowDescription>
            {show?.group}
            <br />
            {show?.location}
          </ShowDescription>
        </Col>
        <Col lg={6}>
          <ShowDescription>
            <strong>Role:</strong> {show?.role}
            <br />
            <strong>Director:</strong> {show?.director}
            <br />
            <strong>Musical Director:</strong> {show?.musicalDirector}
            <br />
            <strong>Recognition:</strong> {show?.recognition}
          </ShowDescription>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <ShowDescription>
            <a href={show?.url} target="_blank">
              Visit Website &gt;
            </a>
          </ShowDescription>
        </Col>
      </Row>
    </ShowCard>
  );
};

export default IndividualCredits;
