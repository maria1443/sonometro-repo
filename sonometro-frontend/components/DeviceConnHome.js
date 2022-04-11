import React from "react";
import { DataGrid, esES } from "@material-ui/data-grid";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme(
  {
    palette: {
      primary: { main: "#828282" },
    },
  },
  esES
);

const columns = [
  { field: "created", headerName: "Fecha de conexión", width: 250 },
];

const DeviceConnHome = ({ connections }) => {
  const transformRow = (connectionRow) => {
    const connectionRowFinal = {
      id: connectionRow._id,
      created: new Date(parseInt(connectionRow.created)).toLocaleString(),
    };

    return connectionRowFinal;
  };

  return (
    <>
      <div
        className="bg-white"
        style={{
          height: window.innerHeight * 0.40,
          width: window.innerWidth * 0.3,
          marginLeft: "30%",
        }}
      >
        <ThemeProvider theme={theme}>
          <DataGrid
            rows={connections.map(transformRow)}
            columns={columns}
            pageSize={5}
            checkboxSelection
          />
        </ThemeProvider>
      </div>
    </>
  );
};
export default DeviceConnHome;
