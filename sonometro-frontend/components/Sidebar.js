import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

const Sidebar = () => {
  const router = useRouter();

  return (
    <aside className ="bg-gradient-to-t from-gray-400 via-gray-600 to-black 
    sm:w-1/3 xl:w-1/5 sm:min-h-screen p-5" >
      <div>
      <Image src="/logo.png" alt="me" width="600" height="400" />
      </div>
      <div>
      <p className="text-white text-center text-xl font-bold py-3">Equilibrio de Volumen Ambiental</p>
      </div>

      <nav className="mt-5 list-none">
        <li
          className={
            router.pathname === "/" || router.pathname === "/report/[pid]"
              ? "bg-gradient-to-r from-gray-700 via-gray-900 to-black p-2"
              : "p-2"
          }
          
        >
          <Link href="/">
            <a className="text-white block">Inicio</a>
          </Link>
        </li>
        <li
          className={router.pathname === "/reports" ? "bg-gradient-to-r from-gray-700 via-gray-900 to-black p-2" : "p-2"}
        >
          <Link href="/reports">
            <a className="text-white block">Reportes</a>
          </Link>
        </li>
        <li
          className={
            router.pathname === "/devices" ||
            router.pathname === "/newLevel1" ||
            router.pathname === "/newLevel2" ||
            router.pathname === "/newDevice" ||
            router.pathname === "/device/[pid]"
              ? "bg-gradient-to-r from-gray-700 via-gray-900 to-black p-2"
              : "p-2"
          }
        >
          <Link href="/devices">
            <a className="text-white block">Equipos</a>
          </Link>
        </li>
      </nav>
    </aside>
  );
};

export default Sidebar;
