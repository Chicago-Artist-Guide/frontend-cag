import React from 'react';
import Image from 'react-bootstrap/Image';

const Team = (props: any) => {
  const { image, key, name, subtitle } = props;

  return (
    <div className="margin-team" key={key}>
      <Image className="shadow-team" roundedCircle src={image} width="100%" />
      <div className="text-center">
        <h3 className="subtitle">{name}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default Team;
