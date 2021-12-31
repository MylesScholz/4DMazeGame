(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['pauseModal'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"pause-backdrop\" class=\"pause-backdrop-hidden\">\r\n    <div id=\"stopwatch\">\r\n        <h3 id=\"stopwatch-title\">Time Elapsed:</h3>\r\n        <p id=\"counter\">00:00</p>\r\n    </div>\r\n    <div id=\"game-buttons-container\">\r\n        <a class=\"game-button\" id=\"menu-button\" href=\"/\">Menu</a>\r\n        <button class=\"game-button\" id=\"pause-button\">Pause</button>\r\n    </div>\r\n    <div class=\"win-message-hidden\" id=\"win-message-container\">\r\n        <h1 id=\"win-message\">Congratulations! You won!</h1>\r\n    </div>\r\n</div>";
},"useData":true});
})();