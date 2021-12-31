(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['menu'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"size-menu\">\r\n    <label for=\"maze-size\">Dimensions of maze (x, y, z, w):</label>\r\n    <input type=\"number\" class=\"maze-size\" name=\"maze-size-1\" min=\"2\" max=\"8\" value=\"4\">\r\n    <input type=\"number\" class=\"maze-size\" name=\"maze-size-2\" min=\"2\" max=\"8\" value=\"4\">\r\n    <input type=\"number\" class=\"maze-size\" name=\"maze-size-3\" min=\"2\" max=\"8\" value=\"4\">\r\n    <input type=\"number\" class=\"maze-size\" name=\"maze-size-4\" min=\"2\" max=\"8\" value=\"4\">\r\n</div>\r\n\r\n<div id=\"name-menu\">\r\n    <label for=\"player-name\">What is your name?</label>\r\n    <input type=\"text\" id=\"player-name\" name=\"player-name\" maxlength=\"50\">\r\n</div>\r\n";
},"useData":true});
})();