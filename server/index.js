var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var sql = require("sqlite3");

var app = express();
var db = null;

var DB_PATH = __dirname + "/notes.sqlite";
var PORT = process.env.PORT || 3000;

// ----------------------------------------------------------------------------
// Setup, Static Routes
// ----------------------------------------------------------------------------
app.use(bodyParser());
app.engine(".hbs", exphbs({
  extname: ".hbs"
}));
app.set("view engine", ".hbs");
app.set("views", __dirname + "/../templates");

// ----------------------------------------------------------------------------
// Static Routes
// ----------------------------------------------------------------------------
app.use("/app/js-dist/*.map", function (req, res) {
  res.send(404, "404"); // Prevent sourcemap serving.
});
app.use("/app/js-dist", express["static"]("app/js-dist"));
app.use("/bootstrap", express["static"]("node_modules/bootstrap/dist"));
app.use("/css", express["static"]("app/css"));

// ----------------------------------------------------------------------------
// Dynamic Routes
// ----------------------------------------------------------------------------
app.get("/", function (req, res) {
  // Get all notes.
  db.prepare("select * from notes").all(function (err, data) {
    if (err) {
      return res.status(500).json(err.message || err.toString() || "error");
    }

    // Render with bootstrapped data.
    res.render("index", {
      layout: false,
      initialData: data && JSON.stringify(data),
      content: "<h1>TODO CONTENT</h1>"
    });
  });
});

// ----------------------------------------------------------------------------
// API
// ----------------------------------------------------------------------------
var _errOrData = function (res, dataOverride) {
  return function (err, data) {
    if (err) {
      res.status(500).json({ error: err.message || err.toString() });
    }

    res.json(dataOverride || data);
  };
};

app.get("/api/notes", function (req, res) {
  db.prepare("select * from notes")
    .all(_errOrData(res));
});

app.post("/api/notes", function (req, res) {
  var title = req.body.title || "",
    text = req.body.text || "";

  db.run("insert into notes (title, text) values(?,?)", title, text)
    .prepare("select * from notes order by id desc limit 1")
    .get(_errOrData(res));
});

app.put("/api/notes/:id", function (req, res) {
  var title = req.body.title,
    text = req.body.text,
    id = req.params.id;

  db.run("update notes set title=?, text=? where id=?", title, text, id)
    .prepare("select * from notes where id=?", id)
    .get(_errOrData(res));
});

app["delete"]("/api/notes/:id", function (req, res) {
  db.run("delete from notes where id=?", req.params.id, _errOrData(res, {}));
});

// ----------------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------------
db = new sql.Database(DB_PATH, sql.OPEN_READWRITE, function () {
  app.listen(PORT);
});
