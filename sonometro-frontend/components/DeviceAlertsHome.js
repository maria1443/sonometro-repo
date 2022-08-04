import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import createTrend from "trendline";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  ReferenceLine,
  Line,
} from "recharts";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

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

const daysPeriod = [];

const locale = {
  localize: {
    month: (n) => months[n],
    day: (n) => days[n],
    dayPeriod: (day) => day.toUpperCase(),
  },
  formatLong: {
    time: () => "h:mm a",
  },
};

const GET_DEVICE_INFO_BY_ALERT = gql`
  query getDeviceInfoByAlert($input: getDeviceInfoDateRangeHomeInput) {
    getDeviceInfoByAlert(input: $input) {
      state
      message
      data {
        deviceMeasurementsAlerts{
          value
          created
        }
        deviceMeasurementsAlertsAvgStd{
          avgValue
          stdValue
        }
        device {
          alerts{
            level1
            level2
            level3
            }
        }
        
        
      }
    }
  }
`;

const DeviceAlertsHome = ({ device_id }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes() + 15,
      startDate.getSeconds()
    )
  );
  const [hourRangeError, setHourRangeError] = useState(null);

  const { loading, error, data } = useQuery(GET_DEVICE_INFO_BY_ALERT, {
    variables: {
      input: {
        device_id: device_id == undefined ? "" : device_id,
        dateStart: startDate,
        dateEnd: endDate,
      },
    },
  });

  /*console.log("error")
  console.log(error)*/

  if (!loading) {
    console.log("data alertas");
    console.log(data);
  }

  const trendDataMeasurementsAlerts = () => {
    if (data != undefined) {
      const createdMeasureAlerts =
        data.getDeviceInfoByAlert.data.deviceMeasurementsAlerts.map(
          (data) => data.created
        );
      const xMaxMeasureAlerts = Math.max(...createdMeasureAlerts);
      const xMinMeasureAlerts = Math.min(...createdMeasureAlerts);
      const trendMeasurementsAlerts = createTrend(
        data.getDeviceInfoByAlert.data.deviceMeasurementsAlerts,
        "created",
        "value"
      );

      return [
        {
          x: xMinMeasureAlerts,
          y: trendMeasurementsAlerts.calcY(xMinMeasureAlerts),
        },
        {
          x: xMaxMeasureAlerts,
          y: trendMeasurementsAlerts.calcY(xMaxMeasureAlerts),
        },
      ];
    } else return [];
  };

  const setEndDateRange = (date) => {
    const dateF = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    );
    if (date > startDate) {
      setEndDate(dateF);
    } else {
      setHourRangeError(true);
      setTimeout(() => {
        setHourRangeError(null);
      }, 3000);
    }
  };

  const setStartDateRange = (date) => {
    const dateEndUpdate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
      endDate.getSeconds()
    );

    setEndDate(dateEndUpdate);
    if (date < dateEndUpdate) {
      setStartDate(date);
    } else {
      setHourRangeError(true);
      setTimeout(() => {
        setHourRangeError(null);
      }, 3000);
    }
  };

  const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      className="flex bg-gray-800 py-1 px-1  text-xs font-bold text-white rounded text-sm hover:bg-gray-900"
      onClick={onClick}
      ref={ref}
    >
      {value}
    </button>
  ));

  const ExampleCustomInput2 = React.forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      className="flex bg-gray-800 py-1 px-1  text-xs font-bold text-white rounded text-sm hover:bg-gray-900"
      onClick={onClick}
      ref={ref}
    >
      {value}
    </button>
  ));

  return (
    <>
      <div style={{ marginLeft: "65%" }}>
        <h2>Día y Rango de horas:</h2>

        <div className="flex mt-2">
          <div>
            <DatePicker
              locale={locale}
              selected={startDate}
              onChange={setStartDateRange}
              showTimeSelect
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="dd/MM/yy h:mm aa"
              customInput={<ExampleCustomInput />}
            />
          </div>
          <div style={{ marginLeft: "4%" }}>
            <DatePicker
              selected={endDate}
              onChange={setEndDateRange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              customInput={<ExampleCustomInput2 />}
            />
          </div>
        </div>
        {hourRangeError ? (
          <div
            className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
            style={{ width: "65%" }}
          >
            <p className="font-bold">Error</p>
            <p>La hora final debe ser mayor a la inicial</p>
          </div>
        ) : (
          <></>
        )}
      </div>
      {data && data.getDeviceInfoByAlert.state ? (
        <>
          {data.getDeviceInfoByAlert.data.deviceMeasurementsAlerts.length !=
          0 ? (
            <>
              <div
                className="bg-white"
                style={{
                  width: window.innerWidth * 0.65,
                  marginLeft: "8%",
                  marginTop: "2%",
                  height: window.innerHeight * 0.65,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      data.getDeviceInfoByAlert.data.deviceMeasurementsAlerts
                    }
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="created"
                      label={{ value: "Tiempo (hh:mm)", position: "bottom" }}
                      tickFormatter={(timeStr) =>
                        moment(new Date(parseInt(timeStr))).format("hh:mm")
                      }
                    />
                    <YAxis
                      dataKey="value"
                      label={{
                        value: "Decibelios (dB)",
                        angle: -90,
                        position: "left",
                      }}
                      type="number"
                      domain={[0, 130]}
                    />
                    <Tooltip
                      labelFormatter={(valueParam) =>
                        moment(new Date(parseInt(valueParam))).format(
                          "DD/MM/YY LTS"
                        )
                      }
                    />
                    <Legend />
                    <Bar
                      name="Decibelios (dB)"
                      dataKey="value"
                      legendType="none"
                      fill="#8884d8"
                    />
                    <ReferenceLine y={data.getDeviceInfoByAlert.data.device.alerts.level1} stroke="green" isFront={true} />
                    <ReferenceLine y={data.getDeviceInfoByAlert.data.device.alerts.level2} stroke="yellow" isFront={true} />
                    <ReferenceLine y={data.getDeviceInfoByAlert.data.device.alerts.level3} stroke="red" isFront={true} />
                    <ReferenceLine
                      label="Tendencia"
                      stroke="green"
                      strokeDasharray="10 3"
                      segment={trendDataMeasurementsAlerts()}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex mt-7" style={{ marginLeft: "30%" }}>
                <div
                  className="flex items-center justify-between bg-white p-3"
                  style={{ width: "30%" }}
                >
                  <h2 className="text-gray text-lg">Promedio (dB):</h2>
                  <p className="text-gray-800 ml-5">
                    {
                      data.getDeviceInfoByAlert.data
                        .deviceMeasurementsAlertsAvgStd.avgValue
                    }
                  </p>
                </div>
                <div
                  className="flex items-center justify-between bg-white p-3"
                  style={{ marginLeft: "5%" }}
                >
                  <h2 className="text-gray text-lg">
                    Desviación estándar (dB):
                  </h2>
                  <p className="text-gray-800 ml-5">
                    {
                      data.getDeviceInfoByAlert.data
                        .deviceMeasurementsAlertsAvgStd.stdValue
                    }
                  </p>
                </div>
              </div>
            </>
          ) : (
            <h2
              className="text-2xl text-gray-800 font-light mt-5"
              style={{ marginLeft: "30%" }}
            >
              No existen datos de alertas en este día y rango de horas
            </h2>
          )}
        </>
      ) : (
        <>
          {data ? (
            <>
              <h2
                className="text-2xl text-gray-800 font-light mt-20"
                style={{ marginLeft: "14%" }}
              >
                Hubo un error en el servidor, revise que el servicio esté
                activo.
              </h2>
            </>
          ) : (
            <>
              <div style={{ marginLeft: "40%" }}>
                <Loader
                  type="ThreeDots"
                  color="#2d3748;"
                  height="100"
                  width="100"
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default DeviceAlertsHome;
