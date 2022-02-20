const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
});

app.get("/", (req, res) => {
  const sevenTrust = req.query.sevenTrust === "true";
  const nineTrust = req.query.nineTrust === "true";

  db("Choice")
    .insert({
      userId: req.query.userId,
      sevenTrust,
      nineTrust,
    })
    .then(() => {
      db("Choice")
        .where({ sevenTrust, nineTrust })
        .count("userId")
        .then((data) => data[0].count)
        .then((count) => {
          db("Choice")
            .count("id")
            .then((data) => {
              const percentage = Math.floor((count / data[0].count) * 100);
              const resData = {
                type: "RealWorld.Commands.DisplayHtml",
                parameters: {
                  content: `<p>${percentage}%의 사용자가 선택했습니다.</p>`,
                },
              };
              res.send(resData);
            });
        });
    });
});

app.listen(process.env.PORT || 3000);
