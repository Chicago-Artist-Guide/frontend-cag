import React from 'react';
import Card from '../../genericComponents/Card';
import { DividerBar } from '../../genericComponents';

const DetailsCard = (props: any) => {
  return (
    <Card header="Personal Details">
      <DividerBar
        style={{
          backgroundImage: 'linear-gradient(90deg,#EFC93D 0%, #82B29A 100%)'
        }}
      />
    </Card>
  );
};

export default DetailsCard;
