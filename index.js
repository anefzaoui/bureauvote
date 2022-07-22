const express = require("express");
const hbs = require("express-hbs");
const requestIp = require("request-ip");
var moment = require("moment");

const app = express();
const port = 3000;
const vote = require("./vote.json");

// initial test
var BLACKLIST = ["41.225.16.242", "197.1.197.224"];

app.use(function (req, res, next) {
  var ipAddress = requestIp.getClientIp(req);
  var timestamps = moment().format("YYYY-MM-DD HH:mm:ss");

  if (BLACKLIST.indexOf(ipAddress) === -1) {
    console.log("NORMAL IP VISIT: " + timestamps + " : " + ipAddress);
    next();
  } else {
    console.log(
      "!!!!!!!!!! BANNED IP VISIT: " + timestamps + " : " + ipAddress
    );
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BANNED.</title>
      </head>
      <body>
        <h1 dir="rtl">
          عفوا، لاحظنا أن عنوان الـ IP هذا (${ipAddress}) والراجع بالنظر لمنظمة 3S
          INF يقوم بتفحص الموقع بصفة دورية حتى بعد إنتهاء الآجال القانونية لتحيين
          مراكز الإقتراع.
          <br />
          إذا كانت الغاية من الزيارة التحقق من قاعدة البيانات أو الحصول على معلومات
          بخصوص تطوير الموقع أو قاعدة البيانات الخاصة به، برجاء الإتصال عبر البريد
          الإلكتروني nefzaoui.a@gmail.com
          <br />
          شكرا
        </h1>

        <!-- Default Statcounter code for bureauvote https://bureauvote.tn/ -->
        <script type="text/javascript">
          var sc_project = 12770555;
          var sc_invisible = 1;
          var sc_security = "c63d2e1d";
        </script>
        <script
          type="text/javascript"
          src="https://www.statcounter.com/counter/counter.js"
          async
        ></script>
        <noscript
          ><div class="statcounter">
            <a title="Web Analytics" href="https://statcounter.com/" target="_blank"
              ><img
                class="statcounter"
                src="https://c.statcounter.com/12770555/0/c63d2e1d/1/"
                alt="Web Analytics"
                referrerpolicy="no-referrer-when-downgrade"
            /></a></div
        ></noscript>
        <!-- End of Statcounter Code -->
      </body>
    </html>
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
  const clientIp = requestIp.getClientIp(req);
  console.log(clientIp);

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
