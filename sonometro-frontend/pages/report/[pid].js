import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { gql, useQuery } from "@apollo/client";
import RangeDatePicker from "../../components/RangeDatePicker";
import Level2Home from "../../components/Level2Home";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const GET_MEAN_LEVELS1 = gql`
  query getMeanLevels1($input: GetMeanLevels1Input) {
    getMeanLevels1(input: $input) {
      state
      message
      data {
        levels1Information {
          _id
          name
          avgAlert
          stdAlert
          avgAverage
          stdAverage
        }
      }
    }
  }
`;

const Report = () => {
  const router = useRouter();
  const {
    query: { id },
  } = router;

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

  const { loading, error, data, startPolling, stopPolling } = useQuery(
    GET_MEAN_LEVELS1,
    {
      variables: {
        input: {
          _idLevel1: id,
          dateStart: startDate,
          dateEnd: endDate == null ? "" : endDate,
        },
      },
    }
  );

  useEffect(() => {
    console.log("localStorage.getItem('dates');");

    if (localStorage.getItem("dates") != null) {
      let { startDateLocal, endDateLocal } = JSON.parse(
        localStorage.getItem("dates")
      );

      startDateLocal = new Date(startDateLocal);
      endDateLocal = new Date(endDateLocal);

      setStartDate(
        new Date(
          startDateLocal.getFullYear(),
          startDateLocal.getMonth(),
          startDateLocal.getDate(),
          0,
          0,
          1
        )
      );
      setEndDate(
        new Date(
          endDateLocal.getFullYear(),
          endDateLocal.getMonth(),
          endDateLocal.getDate(),
          23,
          59,
          59
        )
      );
      localStorage.removeItem('dates');

    }
  }, []);

  useEffect(() => {
    startPolling(1000);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  /*if (!loading) {
    console.log("data");
    console.log(data);
  }*/

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
    <>
      <Layout>
        <div>
          {data && data.getMeanLevels1.state ? (
            <>
              <div className="flex justify-between">
                <div>
                  <h2 className="text-2xl text-gray-800 font-light mt-5">
                    2° Nivel {" - "}
                    {data.getMeanLevels1.data.levels1Information[0].name}
                  </h2>
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

              <div className="flex mt-7 ml-5">
                <div
                  className="flex items-center justify-between bg-white p-3"
                  style={{ width: "51%" }}
                >
                  <h2 className="text-gray text-lg">Promedio total (dB):</h2>
                  <p className="text-gray-800 ml-5">
                    {data.getMeanLevels1.data.levels1Information[0]
                      .avgAverage == -1
                      ? "--"
                      : data.getMeanLevels1.data.levels1Information[0]
                          .avgAverage}
                  </p>
                </div>
                <div
                  className="flex items-center justify-between bg-white p-3"
                  style={{ marginLeft: "5%" }}
                >
                  <h2 className="text-gray text-lg">
                    Desviación estándar de promedio total (dB):
                  </h2>
                  <p className="text-gray-800 ml-5">
                    {data.getMeanLevels1.data.levels1Information[0]
                      .stdAverage == -1
                      ? "--"
                      : data.getMeanLevels1.data.levels1Information[0]
                          .stdAverage}
                  </p>
                </div>
              </div>

              <div className="flex mt-7">
                <div
                  className="flex items-center justify-between bg-white p-3"
                  style={{ marginLeft: "2%", width: "50%" }}
                >
                  <h2 className="text-gray text-lg">
                    Promedio de alertas (dB):
                  </h2>
                  <p className="text-gray-800 ml-5">
                    {data.getMeanLevels1.data.levels1Information[0].avgAlert ==
                    -1
                      ? "--"
                      : data.getMeanLevels1.data.levels1Information[0].avgAlert}
                  </p>
                </div>

                <div
                  className="flex items-center  justify-between bg-white p-3"
                  style={{ marginLeft: "5%", width: "37.5%" }}
                >
                  <h2 className="text-gray text-lg">
                    Desviación estándar de alertas (dB):
                  </h2>
                  <p className="text-gray-800 ml-5">
                    {data.getMeanLevels1.data.levels1Information[0].stdAlert ==
                    -1
                      ? "--"
                      : data.getMeanLevels1.data.levels1Information[0].stdAlert}
                  </p>
                </div>
              </div>
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

          {router.query.pid != undefined ? (
            <Level2Home _idLevel1={router.query.pid} />
          ) : (
            <></>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Report;
