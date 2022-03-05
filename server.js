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
  if (req.query.userId) {
    const sevenTrust = req.query.sevenTrust === "true";
    const nineTrust = req.query.nineTrust === "true";

    db("choice")
      .insert({
        userid: req.query.userId,
        seventrust: sevenTrust,
        ninetrust: nineTrust,
      })
      .then(() => {
        db("choice")
          .where({ seventrust: sevenTrust, ninetrust: nineTrust })
          .count("userid")
          .then((data) => data[0].count)
          .then((count) => {
            db("choice")
              .count("id")
              .then((data) => {
                const percentage = Math.floor((count / data[0].count) * 100);
                const resData = {
                  type: "RealWorld.Commands.DisplayHtml",
                  parameters: {
                    content: `
                    <h1 style="text-align:center;">엔딩 선택 통계</h1>
                    <br />
                    <br />
                    <br />
                    <p>세븐은 '${
                      sevenTrust ? "신뢰를" : "불신을"
                    }' 선택했고, 나인은 '${
                      nineTrust ? "신뢰를" : "불신을"
                    }' 선택했습니다.<p>
                    <p><strong style="color: red; font-size: 1.05rem;">${percentage}%</strong>의 사용자가 위와 같은 선택을 내렸습니다.</p>`,
                  },
                };
                res.send(resData);
              });
          });
      });
  } else res.send("invalid request");
});

app.get("/read-only", (req, res) => {
  const sevenTrust = req.query.sevenTrust === "true";
  const nineTrust = req.query.nineTrust === "true";
  db("choice")
    .where({ seventrust: sevenTrust, ninetrust: nineTrust })
    .count("userid")
    .then((data) => data[0].count)
    .then((count) => {
      db("choice")
        .count("id")
        .then((data) => {
          const percentage = Math.floor((count / data[0].count) * 100);
          const resData = {
            type: "RealWorld.Commands.DisplayHtml",
            parameters: {
              content: `
              <h1 style="text-align:center;">엔딩 선택 통계</h1>
              <br />
              <br />
              <br />
              <p>세븐은 '${
                sevenTrust ? "신뢰를" : "불신을"
              }' 선택했고, 나인은 '${
                nineTrust ? "신뢰를" : "불신을"
              }' 선택했습니다.<p>
              <p><strong style="color: red; font-size: 1.05rem;">${percentage}%</strong>의 사용자가 위와 같은 선택을 내렸습니다.</p>`,
            },
          };
          res.send(resData);
        });
    });
});

app.listen(process.env.PORT || 3000);
