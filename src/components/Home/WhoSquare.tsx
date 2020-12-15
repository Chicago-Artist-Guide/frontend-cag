import React from "react";
import SVGLayer from "../../components/SVGLayer";

const WhoSquare = (props: any) => {
  const { blob, dancer, key, points: whoWeArray, title } = props;

  return (
    <div className="shadow-wwww" key={key}>
      <SVGLayer blob={blob} dancer={dancer} />
      <div className="title-wwww">{title}</div>
      <ul>
        {whoWeArray.map((who: any) => (
          <li key={who.id}>
            <p>{who.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WhoSquare;
