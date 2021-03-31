import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import yellow_blob from '../../images/yellow_blob_1.svg';
import Image from 'react-bootstrap/Image';

const Privacy: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setForm, formData } = props;

  return (
    <Container>
      <Row>
        <Col lg="8">
          <h3>Hi, {formData.basicsFirstName}!</h3>
          <h1>LET'S TALK PRIVACY</h1>
          <h2>Your privacy is our top concern. Always.</h2>
          <p>
            We take privacy seriously (seriously). We will never share, sell, or
            otherwise distribute your information to a third party. We also know
            that some of the information we’re asking for is personal, and for
            some could be sensitive in nature. The reason we’re asking is to
            create the most effective, inclusive, and equitable casting & hiring
            platform possible. If you see “Private” next to a field, that’s
            because even though we’re collecting the information to inform our
            search algorithm, we won’t display this information on your profile,
            or to producers and casting directors. If you’d like to learn more
            about the measures we take to secure your data,{' '}
            <Link to="/faq">click here</Link> [link to FAQs].
          </p>
          <Link to="/terms-of-service">
            <p className="caption">View our full terms and privacy policy</p>
          </Link>
        </Col>
        <Col lg="4">
          <Image alt="" src={yellow_blob} width="100%" />
        </Col>
      </Row>
    </Container>
  );
};

export default Privacy;
