import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';
import { PageContainer, Title } from '../components/layout';
import Button from '../components/shared/Button';
import { useUserContext } from '../context/UserContext';
import Red_Blob from '../images/red_blob.svg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { currentUser } = useUserContext();
  const [email, setEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser]);

  const updateEmail = (e: any) => {
    const val = e.target.value;
    setEmail(val);
  };

  const onSubmit = async () => {
    if (email === '') {
      setResetError('Please enter a valid email address!');
      return;
    }

    await sendPasswordResetEmail(auth, email)
      .then(() => {
        setResetError(null);
        setResetSent(true);
      })
      .catch((err) => {
        setResetError('Error sending reset email.');
        console.log('Error logging in:', err);
      });
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={5}>
          <Title>RESET YOUR PASSWORD</Title>
          {resetError && (
            <Alert key="danger" variant="danger">
              {resetError}
            </Alert>
          )}
          {resetSent ? (
            <>
              <p>
                <strong>Success!</strong> An email has been sent to {email} with
                instructions on how to reset your password.
              </p>
              <p>
                Please{' '}
                <a className="orangeText" href="/login">
                  try logging in again
                </a>{' '}
                or{' '}
                <a className="orangeText" href="/sign-up">
                  sign up
                </a>{' '}
                if you are not a member yet.
              </p>
            </>
          ) : (
            <Form className="margin-team">
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control onChange={updateEmail} type="email" />
              </Form.Group>
              <Form.Text className="text-muted">
                <p>
                  Remember your password now?{' '}
                  <a className="orangeText" href="/login">
                    Try logging in!
                  </a>
                </p>
              </Form.Text>
              <Button
                onClick={onSubmit}
                text="Send Reset Email"
                type="button"
                variant="primary"
              />
            </Form>
          )}
        </Col>
        <Col lg={2} />
        <Col lg={5}>
          <img alt="Chicago Artist Guide" src={Red_Blob} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ForgotPassword;
