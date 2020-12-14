import React from 'react';
import Image from 'react-bootstrap/Image'

function Team(props) {
  return (
      <div className="margin-team" key={props.key}>
            <Image width="100%" className="shadow-team" src={props.image} roundedCircle/>
            <div className="text-center">
                <h3 className="subtitle">{props.name}</h3>
                <p>{props.subtitle}</p>   
            </div>
      </div>    
);
}

export default Team;