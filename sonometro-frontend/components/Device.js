import React from "react";
import Link from "next/link";
import Router from "next/router";


const Device = ({
  devicesData,
  labelNameLevel,
  level1Selected,
  level2Selected,
  saveDevicesFlag,
}) => {
  return (
    <>
      <h2 className="text-2xl text-gray-800 font-light">
        Equipos - {labelNameLevel}
      </h2>

      <div className="flex">
        <button
          type="button"
          className="bg-red-500 py-2 px-5 mt-5 inline-block text-white rounded text-sm hover:bg-gray-800 mb-3"
          onClick={() => {
            saveDevicesFlag(false);
          }}
        >
          Volver al 2° Nivel
        </button>
        <Link
          href={{
            pathname: "/newDevice",
            query: {
              _idLevel1: level1Selected,
              _idLevel2: level2Selected,
              labelNameLevel,
            },
          }}
        >
          <a className="bg-blue-600 ml-10  py-2 px-5 mt-5 inline-block text-white rounded text-sm hover:bg-gray-800 mb-3">
            Nuevo Equipo
          </a>
        </Link>
      </div>

      <table className="table-auto shadow-md mt-10 w-full w-lg mb-10">
        <thead className="bg-gray-800">
          <tr className="text-white">
            <th className="w-1/5 py-2"> Nombre</th>
            <th className="w-1/5 py-2"> Configuración</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {devicesData.map((device) => (
            <tr key={device._id}>              
              <td className="border px-4 py-2 text-center"> {device.name}</td>
              <td className="border px-4 py-2">
                <button
                  type="button"
                  className="flex bg-gray-600 py-2 px-4  text-xs font-bold text-white rounded text-sm hover:bg-gray-900"
                  style={{ marginLeft: "32%" }}
                  onClick={() => {
                    Router.push({
                      pathname: "/device/[id]",
                      query: { id: String(device._id) },
                    });
                  }}
                >
                  Ver/Configurar equipo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 ml-2"
                    style={{ marginTop: 2.4 }}
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {devicesData.length == 0 ? (
        <>
          <h1 className="text-2xl text-center">
            No existen equipos creados en {labelNameLevel}
          </h1>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Device;
