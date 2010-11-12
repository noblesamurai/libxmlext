require.paths.unshift('spec');
require('jspec');
require('unit/spec.helper');

sys = require('sys');
libxml = require("libxmljs");
libxmlext = require('libxmlext');

css2xpath = libxmlext.css2xpath;

JSpec
  .exec('spec/unit/spec.xml.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report();
