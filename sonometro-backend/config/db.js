const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "variables.env" });

const clientDB = new MongoClient(process.env.DB_MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//const connectDB = async () => {

clientDB
  .connect()
  .then((clientDB) => {
    console.log("Base de datos conectada");
  })
  .catch((error) => {
    console.log("Hubo un error conectando la bd");
    console.log(error);
    process.exit(1);
  });

//};

module.exports = clientDB.db();
