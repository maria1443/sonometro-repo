import React, { useState } from "react";
import Layout from "../components/Layout";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";
const NEW_DEVICE = gql`
  mutation newDevice($input: DeviceInput) {
    newDevice(input: $input) {
      state
      message
    }
  }
`;

const NewDevice = () => {
  const router = useRouter();
  const [message, saveMessage] = useState(null);
  const [newDeviceMut] = useMutation(NEW_DEVICE);

  const {
    query: { _idLevel1, _idLevel2,labelNameLevel },
  } = router;

  const formik = useFormik({
    initialValues: {
      name: "",
      deviceID: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El equipo debe tener un nombre"),
      deviceID: Yup.string().required("El equipo debe tener un ID único"),
    }),
    onSubmit: async (values) => {
      console.log("enviando");

      saveMessage("Creando...");

      const { name, deviceID } = values;

      try {
        const { data } = await newDeviceMut({
          variables: { input: { name, deviceID, _idLevel1, _idLevel2 } },
        });
        console.log(data);
        router.push("/devices");
      } catch (error) {
        saveMessage(error.message.replace("GraphQL error: ", ""));
        setTimeout(() => {
          saveMessage(null);
        }, 3000);
        console.log(error);
      }
    },
  });

  const showMessage = () => {
    return (
      <div className="bg-white py-2 px-3 w-full my-3 max-w-sm text-center mx-auto mt-8">
        <p>{message}</p>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <h2 className="text-2xl text-gray-800 font-light mt-10">
          Creación de un nuevo Equipo para {labelNameLevel}
        </h2>

        <div className="flex justify-center mt-20 ">
          <div className="w-full max-w-sm">
            <form
              className="bg-white rounded shadow-md px-8 pt-6 pb-8 mb-4"
              onSubmit={formik.handleSubmit}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Nombre
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                  id="name"
                  type="text"
                  placeholder="Nombre del equipo"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.name && formik.errors.name ? (
                <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                  <p className="font-bold">Error</p>
                  <p>{formik.errors.name}</p>
                </div>
              ) : null}
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="deviceID"
                >
                  ID único
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                  id="deviceID"
                  type="text"
                  placeholder="ID único del equipo"
                  value={formik.values.deviceID}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.deviceID && formik.errors.deviceID ? (
                <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                  <p className="font-bold">Error</p>
                  <p>{formik.errors.deviceID}</p>
                </div>
              ) : null}
              <input
                type="submit"
                className="bg-blue-600 w-full mt-5 p-2 text-white hover:bg-gray-900"
                value="Crear"
              />
              <button
                className="bg-red-500 w-full mt-5 p-2 text-white hover:bg-gray-800"
                onClick={() => {
                  router.push("/devices");
                }}
              >
                Cancelar
              </button>
            </form>

            {message && showMessage()}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NewDevice;
