import React from 'react';
import SVGLayer from '../../components/svg-layer';

function WhoSquare(props) {
  var whoWeArray = props.points;
  return (
      <div className="shadow-wwww" key={props.key}>
            <SVGLayer blob={props.blob} dancer={props.dancer}/>
            <div className="title-wwww">{props.title}</div>
            <ul>
                  {whoWeArray.map(who=>(
                        <li key={who.id}><p>{who.text}</p></li>
                  ))}
            </ul>
      </div>     
);
}

export default WhoSquare;
