import React from "react";
import DatePicker from "react-datepicker";
import Moment from "react-moment";
import "react-datepicker/dist/react-datepicker.css";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const days = ["Do", "Lu", "Ma", "Mié", "Ju", "Vie", "Sa"];

const locale = {
  localize: {
    month: (n) => months[n],
    day: (n) => days[n],
  },
  formatLong: {},
};

const RangeDatePicker = ({ startDate, endDate, onChange }) => {
  const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      className="bg-gray-700  hover:bg-gray-900  py-1 px-1  text-xs font-bold text-white rounded text-sm"
      onClick={onClick}
      ref={ref}
    >
      {endDate ? (
        <>
          <Moment format="DD/MM/YY">{new Date(value)}</Moment>
          <span>&nbsp;&nbsp;</span>
          {"-"} <span>&nbsp;&nbsp;</span>
          <Moment format="DD/MM/YY">{new Date(endDate)}</Moment>
        </>
      ) : (
        <Moment format="DD/MM/YY">{value}</Moment>
      )}
    </button>
  ));

  return (
    <>
      <DatePicker
        locale={locale}
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        shouldCloseOnSelect={false}
        customInput={<ExampleCustomInput />}
      />
    </>
  );
};

export default RangeDatePicker;
