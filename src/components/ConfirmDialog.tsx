import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { fonts } from '../theme/styleVars';

type Props = {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  show: boolean;
};

const ConfirmDialog = ({
  title,
  content,
  onConfirm,
  onCancel,
  show = false
}: Props) => (
  <Modal backdrop="static" show={show} onHide={onCancel} className="z-3">
    <Modal.Header>
      <Modal.Title>
        <Title>{title}</Title>
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>{content}</Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={onConfirm}>
        Confirm
      </Button>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </Modal.Footer>
  </Modal>
);

const Title = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export default ConfirmDialog;
