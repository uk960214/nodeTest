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

const resultTemplate = ({ sevenTrust, nineTrust, percentage }) => {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css?family=Nanum+Myeongjo&display=swap');

      * {
        font-family: 'Nanum Myeongjo', serif;
      }

      .container {
        text-align: center;
      }

      .title {
        font-family: sans-serif;
      }

      .agent-name,
      .choice,
      .result-percent {
        font-size: 1.3rem;
      }

      .trust {
        color: green;
      }

      .distrust {
        color: red;
      }
      
      .result-percent {
        color: yellow
      }
      
      .choice-explain,
      .percent-explain {
        font-family: 'Nanum Myeongjo', serif;
      }
    </style>
    <div class="container">
      <h3 class="title">엔딩 선택 결과</h3>
      <br />
      <br />
      <p class="choice-explain">
        <strong class="agent-name">세븐</strong>은 ${
          sevenTrust
            ? "<strong class='choice trust'>[신뢰]</strong>를"
            : "<strong class='choice distrust'>[불신]</strong>을"
        }
        <br />
        <strong class="agent-name">나인</strong>은 ${
          nineTrust
            ? "<strong class='choice trust'>[신뢰]</strong>를"
            : "<strong class='choice distrust'>[불신]</strong>을"
        } <br />
        선택했습니다.
      </p>
      <br />
      <br />
      <p class="percent-explain">
        <strong class="result-percent">${percentage}%</strong>의 플레이어가
        <br />
        같은 선택을 했습니다.
      </p>
    </div>
  `;
};

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
                    content: resultTemplate({
                      sevenTrust,
                      nineTrust,
                      percentage,
                    }),
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
              content: resultTemplate({
                sevenTrust,
                nineTrust,
                percentage,
              }),
            },
          };
          res.send(resData);
        });
    });
});

// app.get("/reset-database", (req, res) => {
//   db("choice").truncate().then(res.send("success"));
// });

app.listen(process.env.PORT || 3000);
