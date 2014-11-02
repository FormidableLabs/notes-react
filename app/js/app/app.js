/** @jsx React.DOM */
/**
 * Entry point.
 */
/*jshint unused:false */
var $ = require("jquery");
var Backbone = require("backbone");
var React = require("react");

// jQuery: Backbone needs explicit set.
Backbone.$ = $;

// Side-effect: Add in bootstrap.js (uses `window.jQuery` from config).
require("bootstrap/dist/js/bootstrap");

var NotesCollection = require("./collections/notes");
var Router = require("./routers/router");

// ----------------------------------------------------------------------------
// Startup
// ----------------------------------------------------------------------------
// Initialize application components.
var collection = NotesCollection.getInstance();

// Helper: Start up app.
var _startApp = function () {
  var router = new Router();
  Backbone.history.start({
    pushState: true,
    hashChange: false
  });
};

// ----------------------------------------------------------------------------
// Bootstrap / Initialization
// ----------------------------------------------------------------------------
// Initial data from page.
var initialData;
try {
  initialData = JSON.parse($("#initial-data").html());
} catch (err) {}

window.console.log("TODO HERE initialData", initialData);

// Wait until we have our initial collection from the backing
// store before firing up the router.
collection.once("reset", _startApp);

// Now fetch collection data, kicking off everything.
collection.fetch({ reset: true });
