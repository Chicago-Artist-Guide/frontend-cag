import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useAuthValue } from '../context/AuthContext';
import { useFirebaseContext } from '../context/FirebaseContext';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';
import Red_Blob from '../images/red_blob.svg';

const Login = () => {
  const history = useHistory();
  const { firebaseAuth } = useFirebaseContext();
  const { currentUser } = useAuthValue();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      history.push('/profile');
    }
  }, [currentUser]);

  const updateEmail = (e: any) => {
    const val = e.target.value;
    setEmail(val);
  };

  const updatePassword = (e: any) => {
    const val = e.target.value;
    setPassword(val);
  };

  const onLogin = async () => {
    if (email === '' || password === '') {
      // error handling
      return;
    }

    await signInWithEmailAndPassword(firebaseAuth, email, password)
      .then(userCredential => {
        console.log(userCredential.user);
      })
      .catch(err => console.log('Error logging in:', err));
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={5}>
          <Title>WELCOME BACK</Title>
          <Form className="margin-team">
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control onChange={updateEmail} type="email" />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control onChange={updatePassword} type="password" />
            </Form.Group>
            <Form.Text className="text-muted">
              <p>
                Not a member yet?{' '}
                <a className="orangeText" href="/sign-up">
                  Join Us
                </a>
              </p>
            </Form.Text>
            <Button onClick={onLogin} type="button" variant="primary">
              LOG IN
            </Button>
          </Form>
        </Col>
        <Col lg={2} />
        <Col lg={5}>
          <img alt="Chicago Artist Guide" src={Red_Blob} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Login;
