import React from "react";
import Link from "next/link";

const Level1 = ({
  levels1,
  saveLevels2Data,
  saveLevels2,
  saveLabelNameLevel,
  saveLevel1Selected,
}) => {
  return (
    <>
      <h2 className="text-2xl text-gray-800 font-light">1° Nivel</h2>
      <Link href="/newLevel1">
        <a className="bg-gray-700 py-2 px-5 mt-5 inline-block text-white rounded text-sm hover:bg-gray-900 mb-3">
          Nuevo 1° Nivel
        </a>
      </Link>

      <table className="table-auto shadow-md mt-10 w-full w-lg">
        <thead className="bg-gradient-to-b from-gray-700 via-gray-800 to-black">
          <tr className="text-white">
            <th className="w-1/5 py-2"> Nombre</th>
            <th className="w-1/5 py-2"> 2° Nivel</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {levels1.map((level1) => (
            <tr key={level1._id}>
              <td className="border px-4 py-2 text-center"> {level1.name}</td>
              <td className="border px-4 py-2">
                <button
                  type="button"
                  className="flex bg-gray-700 py-2 px-4  text-xs font-bold text-white rounded text-sm hover:bg-gray-900 ml-"
                  style={{ marginLeft: "38%" }}
                  onClick={() => {
                    saveLevels2Data(level1.levels2);
                    saveLevels2(true);
                    saveLabelNameLevel(level1.name);
                    saveLevel1Selected(level1._id);
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
      {levels1.length == 0 ? (
        <>
          <h1 className="text-2xl text-center">
            No existen 1° niveles creados en el sistema
          </h1>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Level1;
