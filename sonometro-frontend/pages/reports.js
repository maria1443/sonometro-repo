import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import { gql, useQuery } from "@apollo/client";
import Router from "next/router";

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
                deviceID
                name
              }
            }
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const Reports = () => {
  const [level1, saveLevel1] = useState("");
  const [level2, saveLevel2] = useState("");
  const [device, saveDevice] = useState("");
  const [levels2Selected, saveLevels2Selected] = useState([]);

  const classes = useStyles();
  const { data, loading, error } = useQuery(GET_USER);

  const handleChangeLevel1 = (event) => {
    saveLevel1(event.target.value);
    saveLevel2("");
    saveDevice("");
  };

  const handleChangeLevel2 = (event) => {
    saveLevel2(event.target.value);
    saveDevice("");
  };

  const handleChangeDevice = (event) => {
    saveDevice(event.target.value);
    console.log(event.target.value);
    Router.push({
      pathname: "/deviceHome/[id]",
      query: { id: String(event.target.value) },
    });
  };

  useEffect(() => {
    if (data && data.getUser.state) {
      data.getUser.data.user.levels1.map((level1UseEffect) => {
        if (level1UseEffect._id == level1) {
          saveLevels2Selected(level1UseEffect.levels2);
        }
      });
    }
  }, [level2]);

  return (
    <div>
      <Layout>
        <h2 className="text-2xl text-gray-800 font-bold py-4">
          Reportes de equipos
        </h2>

        <h2 className="text-xl text-gray-800 font-light mt-5 mb-5">
          Seleccione el 1° Nivel, 2° Nivel y equipo para ver sus estadísticas:
        </h2>

        {data && data.getUser.state ? (
          <>
            <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-outlined-label">
                1° Nivel
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={level1}
                onChange={handleChangeLevel1}
                label="level1"
              >
                {data.getUser.data.user.levels1.map((level1BD) => (
                  <MenuItem key={level1BD._id} value={level1BD._id}>
                    {level1BD.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {level1 ? (
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-outlined-label">
                  2° Nivel
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={level2}
                  onChange={handleChangeLevel2}
                  label="level2"
                >
                  {data.getUser.data.user.levels1.map((level1BD) => {
                    if (level1BD._id == level1) {
                      // console.log(level1BD);

                      if (level1BD.levels2.length == 0) {
                        return (
                          <MenuItem key="" value="">
                            No hay 2° Nivel
                          </MenuItem>
                        );
                      } else {
                        return level1BD.levels2.map((level2BD) => (
                          <MenuItem key={level2BD._id} value={level2BD._id}>
                            {level2BD.name}
                          </MenuItem>
                        ));
                      }
                    }
                  })}
                </Select>
              </FormControl>
            ) : (
              <></>
            )}

            {level2 ? (
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-outlined-label">
                  Equipo
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={device}
                  onChange={handleChangeDevice}
                  label="device"
                >
                  {levels2Selected.map((level2Selected) => {
                    if (level2Selected._id == level2) {
                      if (level2Selected.devices.length == 0) {
                        return (
                          <MenuItem key="" value="">
                            No hay equipos
                          </MenuItem>
                        );
                      } else {
                        return level2Selected.devices.map((deviceBD) => (
                          <MenuItem key={deviceBD._id} value={deviceBD._id}>
                            {deviceBD.name}
                          </MenuItem>
                        ));
                      }
                    }
                  })}
                </Select>
              </FormControl>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
      </Layout>
    </div>
  );
};

export default Reports;
