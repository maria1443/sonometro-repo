import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { gql, useQuery } from "@apollo/client";
import Level1Home from "../components/Level1Home";
import RangeDatePicker from "../components/RangeDatePicker";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { useRouter } from "next/router";

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

const Index = () => {
  const router = useRouter();
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
  const [levels1Information, saveLevels1Information] = useState(null);

  const { loading, error, data, startPolling, stopPolling } = useQuery(
    GET_MEAN_LEVELS1,
    {
      variables: {
        input: {
          dateStart: startDate,
          dateEnd: endDate == null ? "" : endDate,
        },
      },
    }
  );

  useEffect(() => {
    startPolling(1000);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  if (!loading) {
    console.log("data");
    console.log(data);
    if (data) {
      if (data.getMeanLevels1.state == false) {
        localStorage.removeItem("token");
        localStorage.setItem("reload", true);
        router.push("/login");
      }
    }
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

    localStorage.setItem(
      "dates",
      JSON.stringify({ startDateLocal: start, endDateLocal: end })
    );
  };

  return (
    <div>
      <Layout>
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl text-gray-800 font-bold mt-5">Resumen</h2>
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

        {data && data.getMeanLevels1.state ? (
          <Level1Home
            levels1MeanData={data.getMeanLevels1.data.levels1Information}
          />
        ) : (
          <>
            <div style={{ marginLeft: "40%" }}>
              <Loader
                type="ThreeDots"
                color="#122253;"
                height="100"
                width="100"
              />
            </div>
          </>
        )}
      </Layout>
    </div>
  );
};

export default Index;
