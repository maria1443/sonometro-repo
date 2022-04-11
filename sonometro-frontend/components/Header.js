import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";



const GET_USER = gql`
  query getUser {
    getUser {
      state
      message
      data {
        user {
          _id
          name
        }
      }
    }
  }
`;

const Header = () => {
  const { data, loading, error } = useQuery(GET_USER);

  const router = useRouter();

  if (data) {
    if (data.getUser.state == false) router.push("/login");
  }

  const signOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex justify-between mb-6">
      {data && data.getUser.state ? (
        <>
          <p className="mr-2  text-xl font-light">Hola, {data.getUser.data.user.name} !</p>
          <button
            onClick={() => signOut()}
            type="button"
            className="bg-gradient-to-r from-gray-600 via-gray-800 to-gray-900   hover:bg-gray-900  text-1xl  w-full sm:w-auto font-bold text-xs rounded py-1 px-2 text-white shadow-md hover:bg-black "
          >
            Cerrar Sesión
          
          </button>
          

        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Header;
