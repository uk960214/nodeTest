const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "fis960214",
    database: "choice",
  },
});

console.log(
  db
    .select("*")
    .from("Choice")
    .then((data) => {
      console.log(data);
    })
);

app.get("/", (req, res) => {
  db("Choice").insert({
    userId: req.query.userId,
    sevenTrust: req.query.sevenTrust,
    nineTrust: req.query.nineTrust,
  });
  const resData = {
    type: "RealWorld.Commands.DisplayHtml",
    parameters: {
      content: `<p>${req.query.userId}</p>`,
    },
  };
  res.send(resData);
});

app.listen(process.env.PORT || 3000);
