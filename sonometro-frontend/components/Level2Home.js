import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import DeviceHome from "../components/DeviceHome";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const GET_LEVELS2_CHART = gql`
  query getLevels2Chart($input: GetLevels2ChartInput) {
    getLevels2Chart(input: $input) {
      state
      message
      data {
        levels2Information {
          _id
          name
          measurementsArray {
            device_id
            name
            measurements {
              value
              created
            }
          }
        }
      }
    }
  }
`;

const Level2Home = ({ _idLevel1 }) => {
  const {
    loading,
    error,
    data,
    startPolling: startPollingLevel2,
    stopPolling: stopPollingLevel2,
  } = useQuery(GET_LEVELS2_CHART, {
    variables: {
      input: {
        _idLevel1: _idLevel1,
      },
    },
  });

  /*useEffect(() => {
    startPollingLevel2(1000);
    return () => {
      stopPollingLevel2();
    };
  }, [startPollingLevel2, stopPollingLevel2]);*/

  if (!loading) {
    console.log("data");
    console.log(data);
  }

  return (
    <>
      {data && data.getLevels2Chart.state ? (
        <>
          {data.getLevels2Chart.data.levels2Information.length != 0 ? (
            data.getLevels2Chart.data.levels2Information.map((level2) => (
              <div key={level2._id}>
                <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold ml-5 mr-7">
                  {level2.name} {" - "} Alertas de las últimas 6 horas
                </p>
                <DeviceHome level2={level2} />
              </div>
            ))
          ) : (
            <h2
              className="text-2xl text-gray-800 font-light mt-20"
              style={{ marginLeft: "38%" }}
            >
              No existen 2° niveles creados
            </h2>
          )}
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
  );
};

export default Level2Home;
