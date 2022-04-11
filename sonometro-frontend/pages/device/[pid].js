import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Icon } from "@iconify/react";
import bluetoothIcon from "@iconify/icons-mdi/bluetooth";
import { Formik } from "formik";
import * as Yup from "yup";

const GET_DEVICE = gql`
  query getDevice($input: GetDeviceInput) {
    getDevice(input: $input) {
      state
      message
      data {
        device {
          _id
          name
          deviceID
          level1 {
            _id
            name
          }
          level2 {
            _id
            name
          }
          alerts {
            level1
            level2
            level3
          }
          network {
            ssid
            password
          }
          sentTime
          server
        }
      }
    }
  }
`;

const EDIT_DEVICE = gql`
  mutation editDevice($input: DeviceInput) {
    editDevice(input: $input) {
      state
      message
    }
  }
`;

const Device = () => {
  const router = useRouter();

  const [supportsBluetooth, setSupportsBluetooth] = useState(false);

  const [isDisconnected, setIsDisconnected] = useState(true);

  const [bluetoothDevice, setBluetoothDevice] = useState(null);

  const [bluetoothService, setBluetoothService] = useState(null);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const { loading, error, data } = useQuery(GET_DEVICE, {
    variables: { input: { deviceID: router.query.pid } },
  });

  const [editDevice] = useMutation(EDIT_DEVICE);

  useEffect(() => {
    if (navigator.bluetooth) {
      setSupportsBluetooth(true);
    }
  }, []);

  const onDisconnected = (event) => {
    alert(`The device ${event.target} is disconnected`);
    console.log("desconectado");
    console.log(bluetoothDevice);
    setIsDisconnected(true);
  };

  const connectToDeviceAndSubscribeToUpdates = async () => {
    try {
      setLoadingSubmit(false);
      if (isDisconnected) {
        // Search for Bluetooth devices that advertise a battery service
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices:["4fafc201-1fb5-459e-8fcc-c5c9c331914b"]
        });

        setIsDisconnected(false);

        // Add an event listener to detect when a device disconnects
        device.addEventListener("gattserverdisconnected", onDisconnected);

        setBluetoothDevice(device);

        // Try to connect to the remote GATT Server running on the Bluetooth device
        const server = await device.gatt.connect();

        // Get the battery service from the Bluetooth device
        const service = await server.getPrimaryService(
          "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
        );


        setBluetoothService(service);

        /*
      // Get the battery level characteristic from the Bluetooth device
      const characteristic = await service.getCharacteristic("battery_level");

      
      // Subscribe to battery level notifications
      characteristic.startNotifications();

      // When the battery level changes, call a function
      characteristic.addEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );

      // Read the battery level value
      const reading = await characteristic.readValue();

      // Show the initial reading on the web page
      setBatteryLevel(reading.getUint8(0) + "%");

      */
      } else {
        setIsDisconnected(true);
        await bluetoothDevice.gatt.disconnect();
      }
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
  };

  const schemaValidacion = Yup.object({
    wifi: Yup.string()
      .required("El nombre del Wifi es obligatorio")
      .matches(/^(?!.*(>))/, 'El nombre de la red no puede contener ">" '),
    pass: Yup.string().required("La contraseña del Wifi es obligatoria"),
    level1Tr: Yup.number()
      .required("El umbral de la alerta verde es obligatorio")
      .min(0, "El número mínimo del umbral debe ser 0")
      .max(120, "El número máximo del umbral es 120"),
    level2Tr: Yup.number()
      .required("El umbral de la alerta amarilla es obligatorio")
      .min(0, "El número mínimo del umbral debe ser 0")
      .max(120, "El número máximo del umbral es 120"),
    level3Tr: Yup.number()
      .required("El umbral de la alerta roja es obligatorio")
      .min(0, "El número mínimo del umbral debe ser 0")
      .max(120, "El número máximo del umbral es 120"),
    sentTime: Yup.number()
      .required("La hora de envío es obligatoria")
      .min(1, "El número mínimo del umbral debe ser 1")
      .max(12, "El número máximo del umbral es 12"),
    server: Yup.string().required("La dirección del servidor es obligatoria"),
  });

  return (
    <>
      <div>
        <Layout>
          <h1 className="text-2xl text-gray-800 font-light">
            Información del equipo
          </h1>

          {data && data.getDevice.state ? (
            <div
              className="flex justify-center"
              style={{ flexDirection: "row" }}
            >
              <div style={{ width: "40%" }}>
                <div>
                  <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold">
                    Información general
                  </p>
                  <div className="flex items-center mt-5 justify-between bg-white p-3">
                    <h2 className="text-gray text-lg">Nombre</h2>
                    <p className="text-gray-800 mt-0">
                      {data.getDevice.data.device.name}
                    </p>
                  </div>
                  <div className="flex items-center mt-5 justify-between bg-white p-3">
                    <h2 className="text-gray text-lg">ID único</h2>
                    <p className="text-gray-800 mt-0">
                      {data.getDevice.data.device.deviceID}
                    </p>
                  </div>
                  <div className="flex items-center mt-5 justify-between bg-white p-3">
                    <h2 className="text-gray text-lg">1° Nivel</h2>
                    <p className="text-gray-800 mt-0">
                      {data.getDevice.data.device.level1.name}
                    </p>
                  </div>
                  <div className="flex items-center mt-5 justify-between bg-white p-3">
                    <h2 className="text-gray text-lg">2° Nivel</h2>
                    <p className="text-gray-800 mt-0">
                      {data.getDevice.data.device.level2.name}
                    </p>
                  </div>

                  {supportsBluetooth ? (
                    <button
                      type="button"
                      className="flex bg-blue-800 py-2 px-4  text-xs font-bold text-white rounded text-sm hover:bg-gray-800 mt-10"
                      style={{ marginLeft: "23%" }}
                      onClick={connectToDeviceAndSubscribeToUpdates}
                    >
                      {supportsBluetooth &&
                        !isDisconnected &&
                        "Desconectar de dispositivo"}
                      {supportsBluetooth &&
                        isDisconnected &&
                        "Conectar por Bluetooth a dispositivo"}

                      <Icon
                        icon={bluetoothIcon}
                        color="#FFFFFF"
                        width="20"
                        height="20"
                      />
                    </button>
                  ) : (
                    <>
                      <h1
                        className="text-2xl text-gray-800 font-light"
                        style={{ marginLeft: "10%", marginTop: "7%" }}
                      >
                        El navegador no es compatible para conectar con
                        Bluetooth, pruebe con Google chrome
                      </h1>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5" style={{ width: "40%", marginLeft: "10%" }}>
                <div>
                  <p className="mt-5 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold">
                    Configuración
                  </p>

                  <Formik
                    validationSchema={schemaValidacion}
                    enableReinitialize
                    initialValues={{
                      wifi: data.getDevice.data.device.network
                        ? data.getDevice.data.device.network.ssid
                        : "",
                      pass: data.getDevice.data.device.network
                        ? data.getDevice.data.device.network.password
                        : "",
                      level1Tr: data.getDevice.data.device.alerts
                        ? data.getDevice.data.device.alerts.level1
                        : "",
                      level2Tr: data.getDevice.data.device.alerts
                        ? data.getDevice.data.device.alerts.level2
                        : "",
                      level3Tr: data.getDevice.data.device.alerts
                        ? data.getDevice.data.device.alerts.level3
                        : "",
                      sentTime: data.getDevice.data.device.sentTime
                        ? data.getDevice.data.device.sentTime
                        : "",
                      server: data.getDevice.data.device.server
                        ? data.getDevice.data.device.server
                        : "",
                    }}
                    onSubmit={async (values) => {
                      try {
                        console.log("Enviando bluetooth");
                        console.log(values);
                        setLoadingSubmit(true);
                        const characteristicWifi =
                          await bluetoothService.getCharacteristic(
                            "beb5483e-36e1-4688-b7f5-ea07361b26a8"
                          );
                        const characteristicAlarm =
                          await bluetoothService.getCharacteristic(
                            "beb5483e-36e1-4688-b7f5-ea07361b26a9"
                          );
                        const characteristicAverage =
                          await bluetoothService.getCharacteristic(
                            "4fafc201-1fb5-459e-8fcc-c5c9c3319141"
                          );
                        const characteristicServer =
                          await bluetoothService.getCharacteristic(
                            "4fafc201-1fb5-459e-8fcc-c5c9c3319142"
                          );

                        let enc = new TextEncoder();

                        await characteristicWifi.writeValueWithResponse(
                          enc.encode(values.wifi + ">" + values.pass)
                        );

                        await characteristicAlarm.writeValueWithResponse(
                          enc.encode(
                            values.level1Tr +
                            "-" +
                            values.level2Tr +
                            "-" +
                            values.level3Tr
                          )
                        );

                        await characteristicAverage.writeValueWithResponse(
                          enc.encode("7" + "-" + values.sentTime)
                        );

                        await characteristicServer.writeValueWithResponse(
                          enc.encode(values.server)
                        );

                        const { data } = await editDevice({
                          variables: {
                            input: {
                              deviceID: router.query.pid,
                              network: values.wifi + ">" + values.pass,
                              alerts:
                                values.level1Tr +
                                "-" +
                                values.level2Tr +
                                "-" +
                                values.level3Tr,
                              sentTime: "7" + "-" + values.sentTime,
                              server: values.server,
                            },
                          },
                        });

                        setLoadingSubmit(false);
                        console.log("Finaliza modificación y conexión");
                        Router.reload();
                        //await bluetoothDevice.gatt.disconnect();
                        //setIsDisconnected(true);
                      } catch (error) {
                        console.log("ERRORR");
                        console.log(error);
                        alert(
                          "Hubo un error en la conexión, reinicie la conexión bluetooth con el dispositivo."
                        );
                        setIsDisconnected(true);
                        setLoadingSubmit(false);
                      }

                      /* const reading = await characteristicWifi.readValue();
                      console.log("reading.getUint8(0)%");
                      var enc = new TextDecoder("utf-8");
                      console.log(enc.decode(reading));    */
                    }}
                  >
                    {(props) => {
                      //console.log(props)
                      return (
                        <form
                          className="bg-white"
                          onSubmit={props.handleSubmit}
                        >
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <label className="text-gray text-lg" htmlFor="wifi">
                              Red Wifi
                            </label>

                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.network
                                  ? data.getDevice.data.device.network.ssid
                                  : "No configurado"}
                              </p>
                            ) : (
                              <input
                                className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                id="wifi"
                                type="wifi"
                                placeholder="Red Wifi"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.wifi}
                              />
                            )}
                          </div>
                          {props.touched.wifi && props.errors.wifi ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.wifi}</p>
                            </div>
                          ) : null}
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <h2 className="text-gray text-lg" htmlFor="pass">
                              Contraseña de red Wifi
                            </h2>

                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.network
                                  ? data.getDevice.data.device.network.password
                                  : "No configurado"}
                              </p>
                            ) : (
                              <input
                                className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                id="pass"
                                type="pass"
                                placeholder="Contraseña del Wifi"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.pass}
                              />
                            )}
                          </div>
                          {props.touched.pass && props.errors.pass ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.pass}</p>
                            </div>
                          ) : null}
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <h2
                              className="text-gray text-lg"
                              htmlFor="level1Tr"
                            >
                              Umbral Verde (0-120)
                            </h2>

                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.alerts
                                  ? data.getDevice.data.device.alerts.level1
                                  : "No configurado"}
                              </p>
                            ) : (
                              <input
                                className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                id="level1Tr"
                                type="number"
                                min="0"
                                max="120"
                                step="1"
                                placeholder="Umbral de la alerta verde"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.level1Tr}
                              />
                            )}
                          </div>
                          {props.touched.level1Tr && props.errors.level1Tr ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.level1Tr}</p>
                            </div>
                          ) : null}
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <h2
                              className="text-gray text-lg"
                              htmlFor="level2Tr"
                            >
                              Umbral Amarillo (0-120)
                            </h2>
                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.alerts
                                  ? data.getDevice.data.device.alerts.level2
                                  : "No configurado"}
                              </p>
                            ) : (
                              <input
                                className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                id="level2Tr"
                                type="number"
                                min="0"
                                max="120"
                                step="1"
                                placeholder="Umbral de la alerta amarilla"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.level2Tr}
                              />
                            )}
                          </div>
                          {props.touched.level2Tr && props.errors.level2Tr ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.level2Tr}</p>
                            </div>
                          ) : null}
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <h2
                              className="text-gray text-lg"
                              htmlFor="level3Tr"
                            >
                              Umbral Rojo (0-120)
                            </h2>
                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.alerts
                                  ? data.getDevice.data.device.alerts.level3
                                  : "No configurado"}
                              </p>
                            ) : (
                              <input
                                className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                id="level3Tr"
                                type="number"
                                min="0"
                                max="120"
                                step="1"
                                placeholder="Umbral de la alerta roja"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.level3Tr}
                              />
                            )}
                          </div>
                          {props.touched.level3Tr && props.errors.level3Tr ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.level3Tr}</p>
                            </div>
                          ) : null}
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <h2
                              className="text-gray text-lg"
                              htmlFor="sentTime"
                            >
                              Hora de envío (1-12)
                            </h2>

                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.sentTime
                                  ? data.getDevice.data.device.sentTime
                                  : "No configurado"}
                              </p>
                            ) : (
                              <input
                                className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                id="sentTime"
                                type="number"
                                min="1"
                                max="12"
                                step="1"
                                placeholder="Hora de envío"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.sentTime}
                              />
                            )}
                          </div>
                          {props.touched.sentTime && props.errors.sentTime ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.sentTime}</p>
                            </div>
                          ) : null}
                          <div className="flex items-center mt-5 justify-between p-3 ">
                            <h2 className="text-gray text-lg" htmlFor="server">
                              Dirección del servidor
                            </h2>
                            {isDisconnected ? (
                              <p className="text-gray-800 mt-0">
                                {data.getDevice.data.device.server
                                  ? data.getDevice.data.device.server
                                  : "No configurado"}
                              </p>
                            ) : (
                              <>
                                <input
                                  className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                                  id="server"
                                  type="text"
                                  placeholder="Dirección del servidor"
                                  onChange={props.handleChange}
                                  onBlur={props.handleBlur}
                                  value={props.values.server}
                                />
                              </>
                            )}
                          </div>
                          {props.touched.server && props.errors.server ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                              <p className="font-bold">Error</p>
                              <p>{props.errors.server}</p>
                            </div>
                          ) : null}
                          {!isDisconnected ? (
                            <>
                              {loadingSubmit ? (
                                <input
                                  type="submit"
                                  className="bg-blue-900 w-full mt-6 p-2 text-white font-bold"
                                  value="Enviando al dispositivo...."
                                  disabled={true}
                                />
                              ) : (
                                <input
                                  type="submit"
                                  className="bg-blue-800 w-full mt-6 p-2 text-white font-bold hover:bg-gray-900"
                                  value="Enviar datos al dispositivo"
                                />
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl text-center">
                Hubo un error en el servidor, por favor verifique que esté en
                ejecución.
              </h1>
            </>
          )}
        </Layout>
      </div>
    </>
  );
};

export default Device;
