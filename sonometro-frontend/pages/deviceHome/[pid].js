import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import RangeDatePicker from "../../components/RangeDatePicker";
import { gql, useQuery } from "@apollo/client";
import DevicePromDayHome from "../../components/DevicePromDayHome";
import DevicePromHome from "../../components/DevicePromHome";
import DeviceConnHome from "../../components/DeviceConnHome";
import DeviceAlertsHome from "../../components/DeviceAlertsHome";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const GET_DEVICE_INFO_DATE_RANGE_HOME = gql`
  query getDeviceInfoDateRangeHome($input: getDeviceInfoDateRangeHomeInput) {
    getDeviceInfoDateRangeHome(input: $input) {
      state
      message
      data {
        deviceMeasurements {
          __typename
          ... on AlertPromAverage {
            _id
            avgValue
            stdValue
          }

          ... on MeasurementsPromConn {
            _id
            measurements {
              _id
              value
              created
            }
          }
        }
        device {
          name
          level1 {
            name
          }
          level2 {
            name
          }
          alerts {
            level1
            level2
            level3
          }
        }
      }
    }
  }
`;

const DeviceHome = () => {
  const [startDate, setStartDate] = useState(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      0,
      0,
      1
    )
  );
  const [endDate, setEndDate] = useState(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      23,
      59,
      59
    )
  );

  const router = useRouter();
  const {
    query: { pid },
  } = router;

  const { loading, error, data } = useQuery(GET_DEVICE_INFO_DATE_RANGE_HOME, {
    variables: {
      input: {
        device_id: pid == undefined ? "" : pid,
        dateStart: startDate,
        dateEnd: endDate == null ? "" : endDate,
      },
    },
    pollInterval: 500,
  });

  /*useEffect(() => {
    startPolling(1000);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);*/

  if (!loading) {
    console.log("data");
    console.log(data);
  }

  const onChange = (dates) => {
    const [start, end] = dates;

    if (start != null) {
      setStartDate(
        new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          0,
          0,
          1
        )
      );
    } else setStartDate(null);

    if (end != null)
      setEndDate(
        new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
      );
    else setEndDate(null);
  };

  return (
    <Layout>
      <div className="flex justify-between">
        <div>
          {data && data.getDeviceInfoDateRangeHome.state ? (
            <h2 className="text-2xl text-gray-800 font-light mt-5">
              {data.getDeviceInfoDateRangeHome.data.device.level1.name}
              {" >> "}
              {data.getDeviceInfoDateRangeHome.data.device.level2.name}
              {" >> "}
              {data.getDeviceInfoDateRangeHome.data.device.name}
            </h2>
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
        </div>

        <div style={{ marginRight: "10%" }}>
          <h2>Rango de fechas</h2>
          <RangeDatePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
          />
        </div>
      </div>
      {data && data.getDeviceInfoDateRangeHome.state ? (
        <div>
          <div>
            <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold ml-5 mr-7">
              Promedio de alertas por día
            </p>
            {data.getDeviceInfoDateRangeHome.data.deviceMeasurements[4] !=
              null &&
            data.getDeviceInfoDateRangeHome.data.deviceMeasurements[4]
              .measurements != undefined &&
            data.getDeviceInfoDateRangeHome.data.deviceMeasurements[4]
              .measurements.length != 0 ? (
              <>
                <DevicePromDayHome
                  promAlertByDay={
                    data.getDeviceInfoDateRangeHome.data.deviceMeasurements[4]
                      .measurements
                  }
                  alertPromAverage={
                    data.getDeviceInfoDateRangeHome.data.deviceMeasurements[0]
                  }
                  deviceAlerts={
                    data.getDeviceInfoDateRangeHome.data.device.alerts
                  }
                ></DevicePromDayHome>
              </>
            ) : (
              <h2
                className="text-2xl text-gray-800 font-light mt-20"
                style={{ marginLeft: "14%" }}
              >
                No existen datos de alertas en este rango de fechas
              </h2>
            )}
          </div>

          <div>
            <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold ml-5 mr-7">
              Promedios enviados cada 12 horas
            </p>
            {data.getDeviceInfoDateRangeHome.data.deviceMeasurements[2] !=
              null &&
            data.getDeviceInfoDateRangeHome.data.deviceMeasurements[2]
              .measurements != undefined &&
            data.getDeviceInfoDateRangeHome.data.deviceMeasurements[2]
              .measurements.length != 0 ? (
              <>
                <DevicePromHome
                  prom={
                    data.getDeviceInfoDateRangeHome.data.deviceMeasurements[2]
                      .measurements
                  }
                  promAverage={
                    data.getDeviceInfoDateRangeHome.data.deviceMeasurements[1]
                  }
                  deviceAlerts={
                    data.getDeviceInfoDateRangeHome.data.device.alerts
                  }
                ></DevicePromHome>
              </>
            ) : (
              <h2
                className="text-2xl text-gray-800 font-light mt-20"
                style={{ marginLeft: "14%" }}
              >
                No existen datos de promedios cada 12 horas en este rango de
                fechas
              </h2>
            )}
          </div>

          <div>
            <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold ml-5 mr-7">
              Alertas de conexión
            </p>
            {data.getDeviceInfoDateRangeHome.data.deviceMeasurements[3] !=
              null &&
            data.getDeviceInfoDateRangeHome.data.deviceMeasurements[3]
              .measurements != undefined &&
            data.getDeviceInfoDateRangeHome.data.deviceMeasurements[3]
              .measurements.length != 0 ? (
              <>
                <DeviceConnHome
                  connections={
                    data.getDeviceInfoDateRangeHome.data.deviceMeasurements[3]
                      .measurements
                  }
                ></DeviceConnHome>
              </>
            ) : (
              <h2
                className="text-2xl text-gray-800 font-light mt-20"
                style={{ marginLeft: "14%" }}
              >
                No existen datos de conexiones en este rango de fechas
              </h2>
            )}
          </div>
        </div>
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
      <div>
        <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold ml-5 mr-7">
          Alertas
        </p>
        <DeviceAlertsHome device_id={pid} />
      </div>
    </Layout>
  );
};

export default DeviceHome;
