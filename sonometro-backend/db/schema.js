const { gql } = require("apollo-server");

//Schema
const typeDefs = gql`
  union ResDeviceInfoDataRangeHome = AlertPromAverage | MeasurementsPromConn

  type AlertPromAverage {
    _id: String
    avgValue: Float
    stdValue: Float
  }

  type MeasurementsPromConn {
    _id: String
    measurements: [Measurement]
  }

  type Device {
    _id: ID
    name: String
    deviceID: ID
    level1: Level1
    level2: Level2
    alerts: AlertDevice
    network:NetworkDevice
    sentTime:String
    server:String
  }

  type AlertDevice {
    level1: String
    level2: String
    level3: String
  }

  type NetworkDevice {
    ssid: String
    password: String    
  }

  type Level2 {
    _id: ID
    name: String
    devices: [Device]
  }

  type Level1 {
    _id: ID
    name: String
    levels2: [Level2]
  }

  type User {
    _id: ID
    name: String
    email: String
    levels1: [Level1]
  }

  type Measurement {
    _id: String
    value: Float
    deviceID: ID
    created: String
    type: MeasurementType
  }

  enum MeasurementType {
    ALERT
    AVERAGE
  }

  type Level1Aggregate {
    _id: String
    name: String
    avgAlert: Float
    stdAlert: Float
    avgAverage: Float
    stdAverage: Float
  }

  type MeasurementAggregate {
    measurements: [Measurement]
    device_id: String
    name: String
  }

  type Level2Aggregate {
    _id: String
    name: String
    measurementsArray: [MeasurementAggregate]
  }

  type DataResponse {
    token: String
    user: User
    levels1Information: [Level1Aggregate]
    levels2Information: [Level2Aggregate]
    deviceMeasurements: [ResDeviceInfoDataRangeHome]
    deviceMeasurementsAlerts: [Measurement]
    deviceMeasurementsAlertsAvgStd: AlertPromAverage
    device: Device
  }

  type Response {
    state: Boolean
    message: String
    data: DataResponse
  }

  input DataMeasurementInput {
    value: Float
    deviceID: ID!
  }

  input MeasurementInput {
    data: DataMeasurementInput!
  }
  input AuthInput {
    email: String!
    pass: String!
  }

  input Level1Input {
    name: String!
  }

  input Level2Input {
    name: String!
    _idLevel1: ID!
  }

  input DeviceInput {
    name: String
    deviceID: ID!
    _idLevel1: ID
    _idLevel2: ID
    network:String
    alerts:String
    sentTime:String
    server:String
  }

  input GetDeviceInformationInput {
    deviceID: ID!
    dateStart: String!
    dateEnd: String!
  }

  input GetMeanLevels1Input {
    _idLevel1: String
    dateStart: String!
    dateEnd: String!
  }

  input GetLevels2ChartInput {
    _idLevel1: String!
  }

  input getDeviceInfoDateRangeHomeInput {
    device_id: String!
    dateStart: String!
    dateEnd: String!
  }

  input GetDeviceInput {
    deviceID: ID!
  }

  type Query {
    #Users
    getUser: Response

    #Devices
    getDeviceInformation(input: GetDeviceInformationInput): Response
    getDevice(input: GetDeviceInput): Response

    #Home
    getMeanLevels1(input: GetMeanLevels1Input): Response

    #ReportHome
    getLevels2Chart(input: GetLevels2ChartInput): Response

    #DeviceHome
    getDeviceInfoDateRangeHome(input: getDeviceInfoDateRangeHomeInput): Response
    getDeviceInfoByAlert(input: getDeviceInfoDateRangeHomeInput): Response
  }

  type Mutation {
    #Measurements
    newMeasurement(input: MeasurementInput): Response
    newMeasurementProm(input: MeasurementInput): Response

    #Users
    authUser(input: AuthInput): Response

    #Levels1
    newLevel1(input: Level1Input): Response

    #Levels2
    newLevel2(input: Level2Input): Response

    #Devices
    newDevice(input: DeviceInput): Response

    editDevice(input:DeviceInput):Response


  }
`;

module.exports = typeDefs;
