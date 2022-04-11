import React, {useState } from "react";
import { gql, useQuery } from "@apollo/client";
import Layout from "../components/Layout";
import Level1 from "../components/Level1";
import Level2 from "../components/Level2";
import Device from "../components/Device";

const GET_USER = gql`
  query getUser {
    getUser {
      state
      message
      data {
        user {
          levels1 {
            _id
            name
            levels2 {
              _id
              name
              devices {
                _id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const Devices = () => {
  const { data, loading, error } = useQuery(GET_USER);

  const [levels2, saveLevels2] = useState(false);

  const [devicesFlag, saveDevicesFlag] = useState(false);

  const [levels2Data, saveLevels2Data] = useState([]);

  const [devicesData, saveDeviceData] = useState([]);

  const [labelNameLevel, saveLabelNameLevel] = useState("");

  const [level1Selected, saveLevel1Selected] = useState(null);

  const [level2Selected, saveLevel2Selected] = useState(null);
  return (
    <div>
      <Layout>
        {data && data.getUser.state && !levels2 ? (
          <Level1
            levels1={data.getUser.data.user.levels1}
            saveLevels2Data={saveLevels2Data}
            saveLevels2={saveLevels2}
            saveLabelNameLevel={saveLabelNameLevel}
            saveLevel1Selected={saveLevel1Selected}
          />
        ) : (
          <>
            {data && data.getUser.state && levels2 && !devicesFlag ? (
              <Level2
                levels2Data={levels2Data}
                labelNameLevel={labelNameLevel}
                level1Selected={level1Selected}
                saveDeviceData={saveDeviceData}
                saveDevicesFlag={saveDevicesFlag}
                saveLevels2={saveLevels2}
                saveLabelNameLevel={saveLabelNameLevel}
                saveLevel2Selected={saveLevel2Selected}
              />
            ) : (
              <>
                {data && data.getUser.state && devicesFlag ? (
                  <Device
                    devicesData={devicesData}
                    labelNameLevel={labelNameLevel}
                    level1Selected={level1Selected}
                    level2Selected={level2Selected}
                    saveDevicesFlag={saveDevicesFlag}
                  />
                ) : (
                  <>
                    <h1 className="text-2xl text-center">
                      Hubo un error en el servidor, por favor verifique que esté
                      en ejecución.
                    </h1>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Layout>
    </div>
  );
};

export default Devices;