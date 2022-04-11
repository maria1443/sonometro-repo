const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

//servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    //console.log("req.headers");
    //console.log(req.headers["authorization"]);

    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const user = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.SECRET_KEY
        );

        //console.log("user");
        //console.log(user);

        return { user };
      } catch (error) {
        console.log("error de verificación de identidad");
        console.log(error);
      }
    } else {
      //console.log("No token");
      return { user: null };
    }
  },
});

//arancar el servidor
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`);
});
