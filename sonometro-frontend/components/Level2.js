import React from "react";
import Link from "next/link";

const Level2 = ({
  levels2Data,
  labelNameLevel,
  level1Selected,
  saveDeviceData,
  saveDevicesFlag,
  saveLevels2,
  saveLabelNameLevel,
  saveLevel2Selected
}) => {
  return (
    <>
      <h2 className="text-2xl text-gray-800 font-light">
        2° Nivel - {labelNameLevel}
      </h2>

      <div className="flex">
        <button
          type="button"
          className="bg-red-500 py-2 px-5 mt-5 inline-block text-white rounded text-sm hover:bg-gray-800 mb-3"
          onClick={() => {
            saveLevels2(false);
          }}
        >
          Volver al 1° Nivel
        </button>
        <Link
          href={{ pathname: "/newLevel2", query: { _idLevel1: level1Selected, labelNameLevel } }}
        >
          <a className="bg-blue-600 ml-10  py-2 px-5 mt-5 inline-block text-white rounded text-sm hover:bg-gray-800 mb-3">
            Nuevo 2° Nivel
          </a>
        </Link>
      </div>

      <table className="table-auto shadow-md mt-10 w-full w-lg mb-10">
        <thead className="bg-gradient-to-b from-gray-700 via-gray-800 to-black">
          <tr className="text-white">
            <th className="w-1/5 py-2"> Nombre</th>
            <th className="w-1/5 py-2"> Equipos</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {levels2Data.map((level2) => (
            <tr key={level2._id}>
              <td className="border px-4 py-2 text-center"> {level2.name}</td>
              <td className="border px-4 py-2">
                <button
                  type="button"
                  className="flex bg-gray-600 py-2 px-4  text-xs font-bold text-white rounded text-sm hover:bg-gray-900"
                  style={{ marginLeft: "38%" }}
                  onClick={() => {
                    saveDeviceData(level2.devices);
                    saveDevicesFlag(true);
                    saveLabelNameLevel(level2.name);
                    saveLevel2Selected(level2._id)
                  }}
                >
                  Ver equipos
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {levels2Data.length == 0 ? (
        <>
          <h1 className="text-2xl text-center">
            No existen 2° niveles creados en {labelNameLevel}
          </h1>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Level2;
