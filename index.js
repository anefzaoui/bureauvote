const express = require("express");
const hbs = require("express-hbs");
const app = express();
const port = 3000;
const vote = require("./vote.json");

String.prototype.contains = function (string) {
  var keywords = string.split(" ");
  var contain = true;

  for (var i = 0; i < keywords.length && contain; i++) {
    if (keywords[i] == "") continue;
    var regex = new RegExp(keywords[i], "i");
    contain = contain && regex.test(this);
  }
  return contain;
};

app.use(express.static("public"));
app.engine(
  "hbs",
  hbs.express4({
    partialsDir: __dirname + "/views/partials",
    layoutsDir: __dirname + "/views/layouts",
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  res.render("home", {
    title: "قاعدة بيانات مراكز الإقتراع في تونس والخارج",
    layout: "main",
  });
});

app.get("/search", (req, res) => {
  let q = req.query.q || "";
  let qT = q
    .toUpperCase()
    .replace("المدرسة", "")
    .replace("مدرسة", "")
    .replace("الإبتدائية", "")
    .replace("إبتدائية", "")
    .replace("الابتدائية", "")
    .replace("ابتدائية", "")
    .replace("المكتب", "")
    .replace("مكتب", "")
    .replace("الولاية", "")
    .replace("ولاية", "")
    .replace("المعتمدية", "")
    .replace("معتمدية", "")
    .replace("ڨ", "ق")
    .trim();
  if (q == null || q == undefined || qT.length < 4) {
    res.render("search_error", {
      title: "لا يوجد نائج - قاعدة بيانات مراكز الإقتراع",
      error: "رجاءً أدخل أكثر من 4 حروف أو أرقام في خانة البحث",
      layout: "main",
    });
  } else {
    let result = vote.filter((element) => element.join().contains(qT));

    if (result.length > 0) {
      res.render("search", {
        title: "مكتب الإقتراع بعنوان " + q,
        keyword: req.query.q,
        result: result,
        layout: "main",
      });
    } else {
      res.render("search_error", {
        title: "لا يوجد نتائج بعنوان " + q,
        keyword: req.query.q,
        error: "لا يوجد نتائج",
        layout: "main",
      });
    }
  }
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "حول الموقع - قاعدة بيانات مراكز الإقتراع",
    layout: "main",
  });
});

app.listen(port, () => {
  console.log(`Bureau Vote app is now listening on port ${port}`);
});
