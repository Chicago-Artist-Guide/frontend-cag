import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';

const Awards: React.FC<{
  awards: any;
  editMode: boolean;
}> = ({ awards, editMode }) => {
  const awardsIsEmpty = awards.length == 0 ? true : false;

  const EditVersion = () => {
    return (
      <div>
        {awards.map((award: any) => (
          <AwardContainer>
            <Bold>{award.title}</Bold>
            <Bold>{award.year}</Bold>
            <FontAwesomeIcon icon={faXmark} />
          </AwardContainer>
        ))}
      </div>
    );
  };

  return (
    <Container>
      {editMode ? (
        <div>
          <EditVersion />
        </div>
      ) : awardsIsEmpty ? (
        <i>Add Awards Recognition</i>
      ) : (
        awards.map((award: any) => (
          <AwardContainer>
            <Bold>{award.title}</Bold>
            <Bold>{award.year}</Bold>
          </AwardContainer>
        ))
      )}
    </Container>
  );
};

const AwardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin: 6px;
`;

const Bold = styled.p`
  font-weight: bolder;
`;

export default Awards;
