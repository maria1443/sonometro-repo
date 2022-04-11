import React from "react";
import Router from "next/router";

const Level1Home = ({ levels1MeanData }) => {
  return (
    <>
      <table className="table-auto shadow-md mt-10 w-full w-lg">
        <thead className=" bg-gradient-to-b from-gray-700 via-gray-800 to-black ">
          <tr className="text-white">
            <th className="w-1/6 py-2"> 1° Nivel </th>
            <th className="w-1/6 py-2"> Promedio total (dB)</th>
            <th className="w-1/6 py-2">
              Desviación estándar del promedio total (dB)
            </th>
            <th className="w-1/6 py-2"> Promedio de alertas (dB)</th>
            <th className="w-1/6 py-2">Desviación estándar de alertas (dB)</th>
            <th className="w-1/5 py-2"> 2° Nivel</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {levels1MeanData.map((level1) => (
            <tr key={level1._id}>
              <td className="border px-4 py-2">{level1.name}</td>
              <td className="border px-4 py-2">
                {level1.avgAverage == -1 ? "--" : level1.avgAverage}
              </td>
              <td className="border px-4 py-2">
                {level1.stdAverage == -1 ? "--" : level1.stdAverage}
              </td>
              <td className="border px-4 py-2">
                {level1.avgAlert == -1 ? "--" : level1.avgAlert}
              </td>
              <td className="border px-4 py-2">
                {level1.stdAlert == -1 ? "--" : level1.stdAlert}
              </td>
              <td className="border px-4 py-2">
                <button
                  type="button"
                  className="flex bg-gray-700 py-1 px-1  text-xs font-bold text-white rounded text-sm hover:bg-gray-900"
                  style={{ marginLeft: "18%" }}
                  onClick={() => {
                    Router.push({
                      pathname: "/report/[id]",
                      query: { id: level1._id },
                    });
                  }}
                >
                  Ver 2° nivel
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
    </>
  );
};

export default Level1Home;
