import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CAGDatePicker = (props: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DatePicker
      onChange={() => setSelectedDate(selectedDate)}
      onSelect={date => setSelectedDate(date)}
      selected={selectedDate}
    />
  );
};

export default CAGDatePicker;
