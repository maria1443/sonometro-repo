const DAO = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const ObjectID = require("mongodb").ObjectID;

const createToken = (user, secretWord, expiresIn) => {
  //console.log(user);

  const { _id, email } = user;
  return jwt.sign({ _id, email }, secretWord, { expiresIn });
};

// Resolvers
const resolvers = {
  ResDeviceInfoDataRangeHome: {
    __resolveType: (obj) => {
      if (obj._id && obj.avgValue && !obj.created) return "AlertPromAverage";
      if (obj._id && obj.measurements) return "MeasurementsPromConn";
      if (!Object.keys(obj).length) return "AlertPromAverage";
      if (obj.measurements.length == 0) return "MeasurementsPromConn";
      return null;
    },
  },
  Query: {
    getUser: async (_, __, ctx) => {
      //console.log(ctx);

      if (ctx.user == null) {
        return { state: false, message: "No es válido el token" };
      }

      const user = await DAO.collection("users").findOne({
        _id: new ObjectID(ctx.user._id),
      });

      return {
        state: true,
        message: "ok",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            levels1: user.levels1,
          },
        },
      };
    },
    getDeviceInformation: async (_, { input }) => {
      const { deviceID, dateStart, dateEnd } = input;

      const findMeasurements = await DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              deviceID: deviceID,
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
            },
          },
          {
            $group: {
              _id: "$type",
              measurements: {
                $push: {
                  value: "$value",
                  deviceID: "$deviceID",
                  created: "$created",
                },
              },
            },
          },
        ])
        .toArray();

      return {
        state: true,
        message: "ok",
        data: { deviceInformation: findMeasurements },
      };
    },
    getDevice: async (_, { input }) => {
      const { deviceID } = input;

      const device = await DAO.collection("devices").findOne({
        _id: new ObjectID(deviceID),
      });

      return {
        state: true,
        message: "ok",
        data: {
          device: {
            _id: device._id,
            name: device.name,
            deviceID: device.deviceID,
            level1: device.level1,
            level2: device.level2,
            alerts: device.alerts,
            network: device.network,
            sentTime: device.sentTime,
            server: device.server,
          },
        },
      };
    },
    getMeanLevels1: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { _idLevel1, dateStart, dateEnd } = input;

      if (ctx.user == null) {
        return { state: false, message: "No es válido el token" };
      }

      const user = await DAO.collection("users").findOne({
        _id: new ObjectID(ctx.user._id),
      });

      //console.log("user");
      //console.log(user.levels1);

      let orQuery = [];
      let levels1_ids = {};

      for (let i = 0; i < user.levels1.length; i++) {
        const level1 = user.levels1[i];

        if (_idLevel1 == undefined) {
          orQuery.push({ level1_id: level1._id });
          levels1_ids[String(level1._id)] = { name: level1.name };
        } else {
          //console.log("_idLevel1");
          //console.log(_idLevel1);
          if (String(level1._id) == _idLevel1) {
            orQuery.push({ level1_id: level1._id });
            levels1_ids[String(level1._id)] = { name: level1.name };
            break;
          }
        }
      }

      //console.log(levels1_ids);

      const findMeasurements = await DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              $or: orQuery,
              type: { $ne: "CONNECTION" },
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
            },
          },
          {
            $group: {
              _id: { type: "$type", level1_id: "$level1_id" },
              avgValue: { $avg: "$value" },
              stdValue: { $stdDevSamp: "$value" },
            },
          },
        ])
        .toArray();

      //console.log(findMeasurements);

      for (let i = 0; i < findMeasurements.length; i++) {
        const measurement = findMeasurements[i];

        levels1_ids[String(measurement._id.level1_id)][measurement._id.type] = {
          avgValue: measurement.avgValue,
          stdValue: measurement.stdValue,
        };
      }

      let responseArray = [];
      Object.entries(levels1_ids).forEach(([key, value]) => {
        let level1Response = { name: value.name, _id: key };

        if (value.ALERT == undefined) {
          level1Response["avgAlert"] = -1.0;
          level1Response["stdAlert"] = -1.0;
        } else {
          level1Response["avgAlert"] = value.ALERT.avgValue.toFixed(2);
          level1Response["stdAlert"] = value.ALERT.stdValue.toFixed(2);
        }

        if (value.AVERAGE == undefined) {
          level1Response["avgAverage"] = -1.0;
          level1Response["stdAverage"] = -1.0;
        } else {
          level1Response["avgAverage"] = value.AVERAGE.avgValue.toFixed(2);
          level1Response["stdAverage"] = value.AVERAGE.stdValue.toFixed(2);
        }

        responseArray.push(level1Response);
      });

      //console.log(responseArray);

      return {
        state: true,
        message: "ok",
        data: { levels1Information: responseArray },
      };
    },
    getLevels2Chart: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { _idLevel1 } = input;

      if (ctx.user == null) {
        return { state: false, message: "No es válido el token" };
      }

      const level1BD = await DAO.collection("users").findOne(
        { _id: new ObjectID(ctx.user._id) },
        {
          projection: {
            levels1: {
              $elemMatch: { _id: new ObjectID(_idLevel1) },
            },
          },
        }
      );

      //console.log("level1BD");
      //console.log(level1BD);

      let orQuery = [],
        levels2_ids = {},
        devices_ids = {};

      for (let i = 0; i < level1BD.levels1[0].levels2.length; i++) {
        const level2 = level1BD.levels1[0].levels2[i];

        orQuery.push({ level2_id: level2._id });
        levels2_ids[String(level2._id)] = { name: level2.name };

        for (let j = 0; j < level2.devices.length; j++) {
          const device = level2.devices[j];
          devices_ids[String(device._id)] = { name: device.name };
        }
      }

      //console.log(levels2_ids);
      //console.log(devices_ids);
      //console.log(orQuery);

      if (orQuery.length == 0)
        return {
          state: true,
          message: "ok",
          data: { levels2Information: [] },
        };

      let dateEnd = new Date(),
        dateStart = new Date(dateEnd.getTime() - 1000 * 60 * 60 * 6); //última * es las horas
      //dateStart = new Date(2021, 1, 1, 1);

      const findMeasurementsChart = await DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              $or: orQuery,
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
              type: "ALERT",
            },
          },
          {
            $group: {
              _id: { level2_id: "$level2_id", device_id: "$device_id" },
              level2_id: { $first: "$level2_id" },
              device_id: { $first: "$device_id" },
              measurements: { $push: { value: "$value", created: "$created" } },
            },
          },
          {
            $group: {
              _id: "$level2_id",
              measurementsArray: {
                $push: {
                  measurements: "$measurements",
                  device_id: "$device_id",
                },
              },
            },
          },
        ])
        .toArray();

      //console.log(findMeasurementsChart);
      //console.log(findMeasurementsChart[0]);

      for (let i = 0; i < findMeasurementsChart.length; i++) {
        const measurement = findMeasurementsChart[i];

        levels2_ids[String(measurement._id)]["measurementsArray"] =
          measurement.measurementsArray;

        for (let j = 0; j < measurement.measurementsArray.length; j++) {
          const device = measurement.measurementsArray[j];

          levels2_ids[String(measurement._id)]["measurementsArray"][j]["name"] =
            devices_ids[
              levels2_ids[String(measurement._id)]["measurementsArray"][
                j
              ].device_id
            ].name;
        }
      }

      let responseArray = [];
      Object.entries(levels2_ids).forEach(([key, value]) => {
        let level2Response = { name: value.name, _id: key };

        level2Response["measurementsArray"] = value.measurementsArray;

        responseArray.push(level2Response);
      });

      //aconsole.log("CONSULTA GRÁFICA");

      return {
        state: true,
        message: "ok",
        data: { levels2Information: responseArray },
      };
    },
    getDeviceInfoDateRangeHome: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { device_id, dateStart, dateEnd } = input;

      if (ctx.user == null) {
        return { state: false, message: "No es válido el token" };
      }

      const device = DAO.collection("devices").findOne(
        {
          _id: new ObjectID(device_id),
        },
        { projection: { alerts: 1 } }
      );

      const avgStdAlertAverage = DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              type: { $ne: "CONNECTION" },
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
              device_id: ObjectID(device_id),
            },
          },
          {
            $group: {
              _id: "$type",
              avgValue: { $avg: "$value" },
              stdValue: { $stdDevSamp: "$value" },
            },
          },
          {
            $project: {
              _id: "$_id",
              avgValue: { $round: ["$avgValue", 2] },
              stdValue: { $round: ["$stdValue", 2] },
            },
          },
        ])
        .toArray();

      const findMeasurementsPromConnection = DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              type: { $ne: "ALERT" },
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
              device_id: ObjectID(device_id),
            },
          },
          {
            $group: {
              _id: "$type",
              measurements: {
                $push: { _id: "$_id", value: "$value", created: "$created" },
              },
            },
          },
        ])
        .toArray();

      const findMeasurementsAlertAverage = DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              type: "ALERT",
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
              device_id: ObjectID(device_id),
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  date: "$created",
                  timezone: "America/Bogota",
                },
              },
              created: { $first: "$created" },
              value: { $avg: "$value" },
            },
          },
          {
            $sort: {
              created: 1,
            },
          },
          {
            $project: {
              _id: "$_id",
              created: "$created",
              value: { $round: ["$value", 2] },
            },
          },
        ])
        .toArray();

      const [
        resAvgStdAlertAverage,
        resFindMeasurementsPromConnection,
        resFindMeasurementsAlertAverage,
        resDevice,
      ] = await Promise.all([
        avgStdAlertAverage,
        findMeasurementsPromConnection,
        findMeasurementsAlertAverage,
        device,
      ]);

      /* console.log("resAvgStdAlertAverage");
         console.log(resAvgStdAlertAverage);

      console.log("resFindMeasurementsPromConnection");
      console.log(resFindMeasurementsPromConnection);

      console.log("resFindMeasurementsAlertAverage");
      console.log(resFindMeasurementsAlertAverage);*/

      let avgStdAlert, avgStdAverage;

      if (resAvgStdAlertAverage.length != 0) {
        if (resAvgStdAlertAverage[0]._id == "ALERT") {
          avgStdAlert = resAvgStdAlertAverage[0];
          avgStdAverage = resAvgStdAlertAverage[1];
        } else {
          avgStdAverage = resAvgStdAlertAverage[0];
          avgStdAlert = resAvgStdAlertAverage[1];
        }
      } else {
        avgStdAlert = {};
        avgStdAverage = {};
      }

      if (avgStdAlert == undefined)
        avgStdAlert = { _id: "ALERT", avgValue: -1, stdValue: -1 };
      else {
      }
      if (avgStdAverage == undefined)
        avgStdAverage = { _id: "AVERAGE", avgValue: -1, stdValue: -1 };
      else {
      }

      let measurementsProm, measurementsConnection;

      if (resFindMeasurementsPromConnection.length != 0) {
        if (resFindMeasurementsPromConnection[0]._id == "CONNECTION") {
          measurementsConnection = resFindMeasurementsPromConnection[0];
          measurementsProm = resFindMeasurementsPromConnection[1];
        } else {
          measurementsConnection = resFindMeasurementsPromConnection[1];
          measurementsProm = resFindMeasurementsPromConnection[0];
        }
      } else {
        measurementsProm = {};
        measurementsConnection = {};
      }

      //Modificación cristian Inicio

      /*  if (Object.keys(measurementsProm).length != 0) {
        let inicio = measurementsProm.measurements[0];
        let measurementFinalProm = new Array();

        for (let i = 1; i < measurementsProm.measurements.length; i++) {
          const element = measurementsProm.measurements[i];

          let differenceMinutes =
            Math.floor(
              Math.abs((inicio.created - element.created) / 1000) / 60
            ) % 60;

          if (differenceMinutes > 60) {
            measurementFinalProm.push(inicio);
            inicio = element;
          }
        }

        if (measurementFinalProm.length == 0) measurementFinalProm.push(inicio);

        measurementsProm.measurements = measurementFinalProm;
      }*/

      //Modificación cristian Final

      return {
        state: true,
        message: "ok",
        data: {
          deviceMeasurements: [
            avgStdAlert,
            avgStdAverage,
            measurementsProm,
            measurementsConnection,
            {
              _id: "alertByDay",
              measurements: resFindMeasurementsAlertAverage,
            },
          ],
          device: resDevice,
        },
      };
    },
    getDeviceInfoByAlert: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { device_id, dateStart, dateEnd } = input;

      if (ctx.user == null) {
        return { state: false, message: "No es válido el token" };
      }

      if (device_id == "") {
        return {
          state: true,
          message: "ok",
          data: { deviceMeasurementsAlerts: [] },
        };
      }

      const device = DAO.collection("devices").findOne(
        {
          _id: new ObjectID(device_id),
        },
        { projection: { alerts: 1 } }
      );

      const alerts = await DAO.collection("measurements")
        .aggregate([
          {
            $match: {
              device_id: new ObjectID(device_id),
              type: "ALERT",
              created: { $lte: new Date(dateEnd), $gte: new Date(dateStart) },
            },
          },
          {
            $group: {
              _id: null,
              measurements: {
                $push: { created: "$created", value: "$value" },
              },
              avgValue: { $avg: "$value" },
              stdValue: { $stdDevSamp: "$value" },
            },
          },
          {
            $project: {
              measurements: "$measurements",
              avgValue: { $round: ["$avgValue", 2] },
              stdValue: { $round: ["$stdValue", 2] },
            },
          },
        ])
        .toArray();

      const [resAlerts, resDevice] = await Promise.all([alerts, device]);

      if (resAlerts.length == 0)
        resAlerts.push({ measurements: [], avgValue: -1, stdValue: -1 });

      //console.log(resAlerts[0]);

      return {
        state: true,
        message: "ok",
        data: {
          deviceMeasurementsAlerts: resAlerts[0].measurements,
          deviceMeasurementsAlertsAvgStd: {
            avgValue: resAlerts[0].avgValue,
            stdValue: resAlerts[0].stdValue,
          },
          device: resDevice,
        },
      };
    },
  },
  Mutation: {
    newMeasurement: async (_, { input }) => {
      const { data } = input;
      //revisar si el equipo está activo y existe, el usuario está activo,

      //console.log("Llegó dato");
      data["created"] = new Date();
      data["timestamp"] = Date.now();
      let response;

      if (data["value"] == undefined) {
        data["type"] = "CONNECTION";
      } else {
        data["type"] = "ALERT";
      }

      const levelsDevice = await DAO.collection("devices").findOne(
        {
          deviceID: data["deviceID"],
        },
        {
          projection: {
            level1: 1,
            level2: 1,
          },
        }
      );

      if (levelsDevice) {
        data["level1_id"] = levelsDevice.level1._id;
        data["level2_id"] = levelsDevice.level2._id;
        data["device_id"] = levelsDevice._id;
      } else {
        data["level1_id"] = undefined;
        data["level2_id"] = undefined;
        data["device_id"] = undefined;
      }

      const insertManyDB = await DAO.collection("measurements").insertOne(data);

      if (!insertManyDB.result.ok) {
        response = {
          state: false,
          message: "Hubo un error en guardar los datos",
        };
      } else {
        console.log("Guardó correctamente");
        response = {
          state: true,
          message: "Los datos fueron guardados correctamente",
        };
      }

      return response;
    },
    newMeasurementProm: async (_, { input }) => {
      const { data } = input;
      //revisar si el equipo está activo y existe, el usuario está activo,

      //guardar en bd

      const today = new Date();
      const timestamp = Date.now();

      data["created"] = today;
      data["type"] = "AVERAGE";
      data["timestamp"] = timestamp;

      const levelsDevice = await DAO.collection("devices").findOne(
        {
          deviceID: data["deviceID"],
        },
        {
          projection: {
            level1: 1,
            level2: 1,
          },
        }
      );

      if (levelsDevice) {
        data["level1_id"] = levelsDevice.level1._id;
        data["level2_id"] = levelsDevice.level2._id;
        data["device_id"] = levelsDevice._id;
      } else {
        data["level1_id"] = undefined;
        data["level2_id"] = undefined;
        data["device_id"] = undefined;
      }

      const insertManyDB = await DAO.collection("measurements").insertOne(data);
      let response;
      if (!insertManyDB.result.ok) {
        response = {
          state: false,
          message: "Hubo un error en guardar los datos",
        };
      } else {
        console.log("Guardó correctamente");
        response = {
          state: true,
          message: "Los datos fueron guardados correctamente",
        };
      }
      return response;
    },
    authUser: async (_, { input }) => {
      const { email, pass } = input;

      const userExists = await DAO.collection("users").findOne({ email });
      let response;
      //console.log(userExists);
      if (userExists) {
        if (pass == userExists.pass) {
          response = {
            state: true,
            message: "ok",
            data: {
              token: createToken(userExists, process.env.SECRET_KEY, "6d"),
            },
          };
        } else {
          response = {
            state: false,
            message: "El password es incorrecto",
          };
        }
      } else {
        response = {
          state: false,
          message: "El usuario no existe",
        };
      }
      return response;
    },
    newLevel1: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { name } = input;

      //console.log(name);

      const insertLevel1ToUser = await DAO.collection("users").updateOne(
        { _id: new ObjectID(ctx.user._id) },
        { $push: { levels1: { name: name, _id: new ObjectID(), levels2: [] } } }
      );

      //console.log(insertLevel1ToUser);

      if (insertLevel1ToUser.result.ok) return { state: true, message: "ok" };
      else return { state: false, message: "Fallo al crear el servicio" };
    },
    newLevel2: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { name, _idLevel1 } = input;

      //console.log(name);

      const insertLevel2ToUser = await DAO.collection("users").updateOne(
        {
          _id: new ObjectID(ctx.user._id),
          "levels1._id": new ObjectID(_idLevel1),
        },
        {
          $push: {
            "levels1.$.levels2": {
              name: name,
              _id: new ObjectID(),
              devices: [],
            },
          },
        }
      );

      //console.log(insertLevel2ToUser);

      if (insertLevel2ToUser.result.ok) return { state: true, message: "ok" };
      else return { state: false, message: "Fallo al crear el servicio" };
    },
    newDevice: async (_, { input }, ctx) => {
      //console.log(ctx);

      const { name, deviceID, _idLevel1, _idLevel2 } = input;

      //console.log(name);

      const _idDevice = new ObjectID();
      let response;

      const level1BD = await DAO.collection("users").findOne(
        { _id: new ObjectID(ctx.user._id) },
        {
          projection: {
            levels1: {
              $elemMatch: { _id: new ObjectID(_idLevel1) },
            },
          },
        }
      );

      const level1Device = {
        name: level1BD.levels1[0].name,
        _id: new ObjectID(_idLevel1),
      };

      let level2Device = {};

      for (let i = 0; i < level1BD.levels1[0].levels2.length; i++) {
        const level2 = level1BD.levels1[0].levels2[i];

        if (String(level2._id) == _idLevel2) {
          level2Device.name = level2.name;
          level2Device._id = new ObjectID(_idLevel2);
          break;
        }
      }

      const insertDevice = await DAO.collection("devices").insertOne({
        name: name,
        _id: _idDevice,
        deviceID: deviceID,
        level1: level1Device,
        level2: level2Device,
      });

      if (insertDevice.result.ok) {
        const insertDeviceToUser = await DAO.collection("users").updateOne(
          {
            _id: new ObjectID(ctx.user._id),
            "levels1._id": new ObjectID(_idLevel1),
          },
          {
            $push: {
              "levels1.$.levels2.$[idLevel2].devices": {
                name: name,
                _id: _idDevice,
                deviceID: deviceID,
              },
            },
          },
          { arrayFilters: [{ "idLevel2._id": new ObjectID(_idLevel2) }] }
        );
        if (insertDeviceToUser.result.ok)
          response = { state: true, message: "ok" };
        else {
          response = {
            state: false,
            message: "Error al crear el equipo en el usuario",
          };
          const deleteDeviceBadInserted = await DAO.collection(
            "devices"
          ).deleteOne({ _id: _idDevice });
        }
      } else
        response = {
          state: false,
          message: "Error al crear el equipo en la colección",
        };

      return response;
    },
    editDevice: async (_, { input }, ctx) => {
      //console.log(input);

      const { deviceID, network, alerts, sentTime, server } = input;

      const networkFullData = network.split(">"),
        alertsFullData = alerts.split("-"),
        sentTimeFullData = sentTime.split("-");

      const updateDeviceSetup = await DAO.collection("devices").updateOne(
        { _id: new ObjectID(deviceID) },
        {
          $set: {
            network: { ssid: networkFullData[0], password: networkFullData[1] },
            alerts: {
              level1: alertsFullData[0],
              level2: alertsFullData[1],
              level3: alertsFullData[2],
            },
            sentTime: sentTimeFullData[1],
            server: server,
          },
        }
      );

      if (updateDeviceSetup.result.ok) return { state: true, message: "ok" };
      else
        return {
          state: false,
          message: "Fallo al guardar los datos del dispositivo",
        };
    },
  },
};

module.exports = resolvers;
