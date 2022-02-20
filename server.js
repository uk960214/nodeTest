const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  const resData = {
    type: "RealWorld.Commands.DisplayHtml",
    parameters: {
      content: `<p>${req.query.userId}</p>`,
    },
  };
  res.send(resData);
});

app.listen(process.env.PORT || 3000);
