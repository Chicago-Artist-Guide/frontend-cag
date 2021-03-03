import React from 'react';
import styled from 'styled-components';
import Image from 'react-bootstrap/Image';

const Team = (props: any) => {
  const { image, key, name, pronoun, subtitle } = props;

  return (
    <MarginTeam key={key}>
      <ShadowTeam
        className="shadow-team"
        roundedCircle
        src={image}
        width="100%"
      />
      <div className="text-center">
        <h3>{name}</h3>
        <h5>({pronoun})</h5>
        <p>{subtitle}</p>
      </div>
    </MarginTeam>
  );
};

const ShadowTeam = styled(Image)`
  box-shadow: 2px 2px 10px rgba(0, 0, 29, 0.1);
  margin-bottom: 10px;
  margin-top: 10px;
`;

const MarginTeam = styled.div`
  margin-top: 50px;
  margin-bottom: 50px;
`;

export default Team;
