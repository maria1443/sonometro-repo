import React, { useState } from "react";
import Layout from "../components/Layout";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";

const AUTH_USER = gql`
  mutation authUser($input: AuthInput) {
    authUser(input: $input) {
      state
      message
      data {
        token
      }
    }
  }
`;

const Login = () => {
  const router = useRouter();
  const [message, saveMessage] = useState(null);
  const [authUser] = useMutation(AUTH_USER);

  const formik = useFormik({
    initialValues: {
      email: "",
      pass: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("El email no es válido")
        .required("El email es obligatorio"),
      pass: Yup.string().required("La contraseña no puede ir vacía"),
    }),
    onSubmit: async (values) => {
      console.log("enviando");
      //console.log(values);

      saveMessage("Autenticando...");

      const { email, pass } = values;

      try {
        const { data } = await authUser({
          variables: { input: { email, pass } },
        });
        console.log(data);
        if (data.authUser.state) {
          const { token } = data.authUser.data;
          localStorage.setItem("token", token);
          saveMessage(null);
          router.push("/", "/");
        } else {
          saveMessage(data.authUser.message);
          setTimeout(() => {
            saveMessage(null);
          }, 5000);
        }
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
      <div className="bg-white py-2 px-3 w-full my-3 max-w-sm text-center mx-auto">
        <p>{message}</p>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <h1 className="text-2xl text-center text-white font-bold py-4">
          Equilibrio de Volumen Ambiental
        </h1>

        {message && showMessage()}

        <div className="flex justify-center ">
          <div className="w-full max-w-sm">
            <form
              className="bg-white rounded shadow-md px-8 pt-6 pb-8 mb-4"
              onSubmit={formik.handleSubmit}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-600 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                  id="email"
                  type="email"
                  placeholder="Email del usuario"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.email && formik.errors.email ? (
                <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-600 p-4">
                  <p className="font-bold">Error</p>
                  <p>{formik.errors.email}</p>
                </div>
              ) : null}
              <div>
                <label
                  className="block text-gray-600 text-sm font-bold mb-2"
                  htmlFor="pass"
                >
                  Contraseña
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                  id="pass"
                  type="password"
                  placeholder="Contraseña del usuario"
                  value={formik.values.pass}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.pass && formik.errors.pass ? (
                <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-600 p-4">
                  <p className="font-bold">Error</p>
                  <p>{formik.errors.pass}</p>
                </div>
              ) : null}
              <input
                type="submit"
                className="bg-gray-800 w-full mt-5 p-2 text-white hover:bg-gray-900"
                value="Iniciar Sesión"
              />
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Login;
