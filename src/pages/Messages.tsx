import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import PageContainer from '../components/layout/PageContainer';
import { MessageProvider } from '../context/MessageContext';
import { useFirebaseContext } from '../context/FirebaseContext';
import { Title } from '../components/layout/Titles';

const Messages = () => {
  const { firebaseFirestore } = useFirebaseContext();

  return (
    <MessageProvider firestore={firebaseFirestore}>
      <PageContainer>
        <Row>
          <Col lg={12}>
            <Title>Messages</Title>
          </Col>
        </Row>
      </PageContainer>
    </MessageProvider>
  );
};

export default Messages;
