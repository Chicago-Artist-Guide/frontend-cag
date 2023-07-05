import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { UpcomingPerformances } from '../../SignUp/Individual/types';
import {
  RightCol,
  ShowCard,
  ShowImage,
  ShowName,
  ShowDescription
} from '../Company/Production/ActiveProduction';

const IndividualUpcomingShow: React.FC<{
  show: UpcomingPerformances;
}> = ({ show }) => {
  return (
    <ShowCard>
      <Row>
        <Col lg={4}>
          <ShowImage src={show?.imageUrl} fluid />
        </Col>
        <RightCol lg={8}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <div className="flex-grow-1">
              <ShowName>{show?.title}</ShowName>
              <ShowDescription>{show?.synopsis}</ShowDescription>
              <ShowDescription>
                <strong>Industry Code:</strong> {show?.industryCode}
                <br />
                <strong>Website:</strong>{' '}
                <a href={show?.url} target="_blank">
                  {show?.url}
                </a>
              </ShowDescription>
            </div>
          </div>
        </RightCol>
      </Row>
    </ShowCard>
  );
};

export default IndividualUpcomingShow;
