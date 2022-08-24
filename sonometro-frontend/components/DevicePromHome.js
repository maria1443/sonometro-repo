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
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const DevicePromHome = ({ prom, promAverage, deviceAlerts }) => {
  
  const trendDataMeasurementsAlerts = () => {
    if (prom != undefined) {
      const createdMeasureAlerts = prom.map((data) => data.created);
      const xMaxMeasureAlerts = Math.max(...createdMeasureAlerts);
      const xMinMeasureAlerts = Math.min(...createdMeasureAlerts);
      const trendMeasurementsAlerts = createTrend(prom, "created", "value");

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
            data={prom}
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
              label={{ value: "Fecha (dd/mm/yy)", position: "bottom" }}
              tickFormatter={(timeStr) =>
                moment(new Date(parseInt(timeStr))).format("DD/MM/YY")
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
                moment(new Date(parseInt(valueParam))).format("DD/MM/YY LTS")
              }
            />
            <Legend />
            <Bar
              name="Decibelios (dB)"
              dataKey="value"
              legendType="none"
              fill="#718BA6"
            />
            {/*<ReferenceLine y={parseInt(deviceAlerts.level1)} stroke="green" isFront={true} />*/}
            <ReferenceLine y={parseInt(deviceAlerts.level2)} stroke="yellow" isFront={true}/>
            <ReferenceLine y={parseInt(deviceAlerts.level3)} stroke="red" isFront={true} />
            <ReferenceLine
              label="Tendencia"
              stroke="green"
              strokeDasharray="10 3"
              segment={trendDataMeasurementsAlerts()}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex mt-7" style={{ marginLeft: "15%" }}>
        <div
          className="flex items-center justify-between bg-white p-3"
          style={{ width: "30%" }}
        >
          <h2 className="text-gray text-lg">Promedio total (dB):</h2>
          <p className="text-gray-800 ml-5">{promAverage.avgValue}</p>
        </div>
        <div
          className="flex items-center justify-between bg-white p-3"
          style={{ marginLeft: "5%" }}
        >
          <h2 className="text-gray text-lg">
            Desviación estándar de promedio total (dB):
          </h2>
          <p className="text-gray-800 ml-5">{promAverage.stdValue}</p>
        </div>
      </div>
    </>
  );
};

export default DevicePromHome;
