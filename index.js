const express = require("express");
const hbs = require("express-hbs");
const app = express();
const port = 3000;
const vote = require("./vote.json");

// initial test
var BLACKLIST = ["102.157.167.169"];

var getClientIp = function (req) {
  var ipAddress = req.socket.remoteAddress;
  if (!ipAddress) {
    return "";
  }
  // convert from "::ffff:192.0.0.1"  to "192.0.0.1"
  if (ipAddress.substr(0, 7) == "::ffff:") {
    ipAddress = ipAddress.substr(7);
  }
  return ipAddress;
};

app.use(function (req, res, next) {
  var ipAddress = getClientIp(req);
  if (BLACKLIST.indexOf(ipAddress) === -1) {
    next();
  } else {
    res.send(`
    <h1 dir="rtl">
    عفوا، لاحظنا أن عنوان الـ IP هذا (${ipAddress}) والراجع بالنظر لمنظمة 3S INF يقوم بتفحص الموقع بصفة دورية حتى بعد إنتهاء الآجال القانونية لتحيين مراكز الإقتراع.
    <br/>
    إذا كانت الغاية من الزيارة التحقق من قاعدة البيانات أو الحصول على معلومات بخصوص تطوير الموقع أو قاعدة البيانات الخاصة به، برجاء الإتصال عبر البريد الإلكتروني nefzaoui.a@gmail.com
    <br/>
    شكرا
    </h1>
    `);
  }
});

app.use(
  require("express-status-monitor")({
    title: "Bureau Vote Status", // Default title
    theme: "default.css", // Default styles
    path: "/admin/site_status",
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      eventLoop: true,
      heap: true,
      responseTime: true,
      rps: true,
      statusCodes: true,
    },
    healthChecks: [],
    ignoreStartsWith: "/admin",
  })
);

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

function cleanUpSearchTerm(str) {
  return str
    .toUpperCase()
    .replace(/(\d+)/g, function (_, num) {
      return " " + num + " ";
    })
    .replace("المدرسة", "")
    .replace("مدرسة", "")

    .replace("الإبتدائية", "")
    .replace("إبتدائية", "")

    .replace("الابتدايية", "")
    .replace("ابتدايية", "")

    .replace("الابتدائية", "")
    .replace("ابتدائية", "")

    .replace("المكتب", "")
    .replace("مكتب", "")

    .replace("الولاية", "")
    .replace("ولاية", "")

    .replace("المعتمدية", "")
    .replace("معتمدية", "")

    .replace("المعهد", "")
    .replace("معهد", "")

    .replace("ننهج", "نهج")
    .replace("ڨ", "ق")
    .replace("أ", "ا")
    .replace("إ", "ا")
    .replace("بال", "ال")
    .trim();
}

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
  console.log(req.socket.remoteAddress);
  res.render("home", {
    title: "قاعدة بيانات مراكز الإقتراع في تونس والخارج",
    layout: "main",
  });
});

app.get("/search", (req, res) => {
  let fld = req.query.fld || "";
  let q = req.query.q || "";
  let qT = cleanUpSearchTerm(q);

  if (Object.keys(req.query).length !== 0) {
    if (q !== "" && q.length > 2) {
      if (fld !== "") {
        let resFld = vote.filter((element) => element[fld] === q);
        if (resFld.length > 0) {
          res.render("search", {
            title: "مراكز الإقتراع بعنوان " + q,
            keyword: req.query.q,
            result: resFld,
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
      } else {
        let result = vote.filter((element) => element.join().contains(qT));

        if (result.length > 0) {
          res.render("search", {
            title: "مراكز الإقتراع بعنوان " + q,
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
    } else {
      res.render("search_error", {
        title: "لا يوجد نائج - قاعدة بيانات مراكز الإقتراع",
        error: "رجاءً أدخل أكثر من 4 حروف أو أرقام في خانة البحث",
        layout: "main",
      });
    }
  } else {
    res.render("search_error", {
      title: "لا يوجد نائج - قاعدة بيانات مراكز الإقتراع",
      error: "رجاءً أدخل أكثر من 4 حروف أو أرقام في خانة البحث",
      layout: "main",
    });
  }
});

app.get("/api", (req, res) => {
  let fld = req.query.fld || "";
  let q = req.query.q || "";
  let qT = cleanUpSearchTerm(q);

  if (Object.keys(req.query).length !== 0) {
    if (q !== "" && q.length > 2) {
      if (fld !== "") {
        let resFld = vote.filter((element) => element[fld] === q);
        if (resFld.length > 0) {
          res.json(resFld);
        } else {
          res.json([]);
        }
      } else {
        let result = vote.filter((element) => element.join().contains(qT));

        if (result.length > 0) {
          res.json(result);
        } else {
          res.json([]);
        }
      }
    } else {
      res.json([]);
    }
  } else {
    res.json([]);
  }
});

app.get("/alldatasets", (req, res) => {
  res.render("search", {
    title: "جميع بيانات محرك البحث",
    keyword: "",
    result: vote,
    layout: "main",
  });
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
