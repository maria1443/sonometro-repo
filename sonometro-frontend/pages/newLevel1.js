import React, { useState } from "react";
import Layout from "../components/Layout";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";
const NEW_LEVEL_1 = gql`
  mutation newLevel1($input: Level1Input) {
    newLevel1(input: $input) {
      state
      message
    }
  }
`;

const NewLevel1 = () => {
  const router = useRouter();
  const [message, saveMessage] = useState(null);
  const [newLevel1Mut] = useMutation(NEW_LEVEL_1);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El 1° Nivel debe tener un nombre"),
    }),
    onSubmit: async (values) => {
      console.log("enviando");

      saveMessage("Creando...");

      const { name } = values;

      try {
        const { data } = await newLevel1Mut({
          variables: { input: { name } },
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
          Creación de un nuevo 1° Nivel
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
                  placeholder="Nombre del 1° Nivel"
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

export default NewLevel1;
