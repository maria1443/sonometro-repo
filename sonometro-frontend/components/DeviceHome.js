import React from "react";
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
  ReferenceLine,
} from "recharts";
import Router from "next/router";

const DeviceHome = ({ level2 }) => {
  const trendDataMeasurementsAlerts = (dataByChart) => {
    if (dataByChart != undefined) {
      const createdMeasureAlerts = dataByChart.map((data) => data.created);
      const xMaxMeasureAlerts = Math.max(...createdMeasureAlerts);
      const xMinMeasureAlerts = Math.min(...createdMeasureAlerts);
      const trendMeasurementsAlerts = createTrend(
        dataByChart,
        "created",
        "value"
      );

      console.log("lol");
      console.log([
        {
          x: xMinMeasureAlerts,
          y: trendMeasurementsAlerts.calcY(xMinMeasureAlerts),
        },
        {
          x: xMaxMeasureAlerts,
          y: trendMeasurementsAlerts.calcY(xMaxMeasureAlerts),
        },
      ]);

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

  return (
    <>
      {level2.measurementsArray != null ? (
        <>
          <div className="flex mt-7 ml-5 overflow-auto">
            {level2.measurementsArray.map((device) => (
              <div
                key={device.device_id}
                className="flex-col items-center justify-between bg-white p-3 h-3/6 mr-10"
              >
                <h2 className="text-gray text-lg mb-5">{device.name}:</h2>

                <BarChart
                  width={450}
                  height={250}
                  data={device.measurements}
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
                    label={{ value: "Tiempo (HH:mm)", position: "bottom" }}
                    tickFormatter={(timeStr) =>
                      moment(new Date(parseInt(timeStr))).format("HH:mm")
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
                  <ReferenceLine y={40} stroke="green" isFront={true} />
                  <ReferenceLine y={80} stroke="yellow" isFront={true} />
                  <ReferenceLine y={120} stroke="red" isFront={true} />
                  <ReferenceLine
                    label="Tendencia"
                    stroke="green"
                    strokeDasharray="10 3"
                    segment={trendDataMeasurementsAlerts(device.measurements)}
                  />
                </BarChart>
                <button
                  type="button"
                  className="flex bg-gray-800 py-2 px-4  text-xs font-bold text-white rounded text-sm hover:bg-gray-900 mt-5"
                  style={{ marginLeft: "38%" }}
                  onClick={() => {
                    Router.push({
                      pathname: "/deviceHome/[id]",
                      query: { id: device.device_id },
                    });
                  }}
                >
                  Ver equipo en detalle
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 ml-2"
                    style={{ marginTop: 2.4 }}
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2
            className="text-2xl text-gray-800 font-light mt-5"
            style={{ marginLeft: "31%" }}
          >
            No existen datos de las últimas 6 horas en {level2.name}
          </h2>
        </>
      )}
    </>
  );
};

export default DeviceHome;
