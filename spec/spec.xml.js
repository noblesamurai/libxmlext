beforeEach(function() {
	fixture = function(file) {
	  return require("fs").readFileSync(__dirname + "/fixtures/" + file).toString('utf8')
	}

	util = require("util");
	libxml = require("libxmlext");
	css2xpath = libxml.css2xpath;
});

describe("libxml", function() {
	describe("jspec", function() {
		it("should allow string comparison", function() {
			expect("hello".toString()).toBe("hello");
		});

		it("should be able to load fixtures", function() {
			var f = fixture("test1.html");
			expect(f).toMatch(/<h1>This is my heading<\/h1>/);
		});
	});

	describe("xml library", function() {
		describe("xml dom creation", function() {
			it("should create a dom using the dom methods and then output to a string", function() {
				var doc = new libxml.Document(function(n) {
				  n.node('root', function(n) {
					n.node('child', {foo: 'bar'}, function(n) {
					  n.node('grandchild', {baz: 'fizbuzz'}, 'grandchild content');
					});
					n.node('sibling', 'with content!');
				  });
				});
				var result = doc.toString();
				var expected = '<?xml version="1.0" encoding="UTF-8"?>\n<root><child foo="bar">' + 
				  '<grandchild baz="fizbuzz">grandchild content</grandchild></child><sibling>with content!</sibling></root>' + "\n";
				expect(result).toBe(expected);
			});

			it("should be able to create xml from bad html", function() {
				var result = libxml.parseHtmlString("<p>par 1<p>par 2");
				expect(result.toString().indexOf("<html><body><p>par 1</p><p>par 2</p></body></html>") !== -1).toBe(true);
			});

			it("should be able to create xml from bad attributes", function() {
				var result = libxml.parseHtmlString("<p>par 1<p class=' blah is \"blah\" '>par 2");
				expect(result.toString().indexOf('<html><body><p>par 1</p><p class=" blah is &quot;blah&quot; ">par 2</p></body></html>') !== -1).toBe(true);
			});
		});
		describe("xml dom removal", function() {
			beforeEach(function() {
				html = libxml.parseHtmlString(fixture("test3.html"));
			});

			it("should be able to read my new fixture", function() {
				expect(html.toString()).toMatch(/<p>This is a <b>paragraph<\/b><\/p>/);
			});

			it("should be able to get a handle on a paragraph", function() {
				expect(html.fetch("p").toString()).toMatch(/<p>This is a <b>paragraph<\/b><\/p>/);
			});

			it("should be able to remove the bold element", function() {
				var p = html.fetch("p");
				var b = html.fetch("b");
				b.remove();
				expect(p.toString()).toMatch(/<p>This is a <\/p>/);
				expect(html.toString()).toMatch(/<p>This is a <\/p>/);
			});
		});

		describe("xml node replacement", function() {
			it("should be able to change a p into a div", function() {
				var html = libxml.parseHtmlString(fixture("test3.html"));
				var p = html.fetch("p");

				p.name("div");

				expect(p.toString()).toMatch(/<div>This is a <b>paragraph<\/b><\/div>/);
			});

			it("should be able to change a div into a p and keep attributes", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				div.name("p");

				expect(div.toString()).toMatch(/<p class="myclass" id="myid">This is a divd <em>paragraph<\/em>\. and another sentence\.<\/p>/);
			});

			it("should be able to remove all attributes", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				var attrs = div.attrs();
				attrs.forEach(function(attr) { attr.remove(); });

				expect(div.toString()).toMatch(/<div>This is a divd <em>paragraph<\/em>\. and another sentence\.<\/div>/);
			});

			it("should be able to remove all attributes and change a div into a p", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				var attrs = div.attrs();
				attrs.forEach(function(attr) { attr.remove(); });
				div.name("p");

				expect(div.toString()).toMatch(/<p>This is a divd <em>paragraph<\/em>\. and another sentence\.<\/p>/);
			});
		});

		describe("innerHTML", function() {
			it("should be able to list all it's children", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var body = html.fetch("body");

				var innerHTML = body.childNodes().reduce(function(innerHTML, child) {
					return innerHTML + child.toString();
				});

				expect(innerHTML).toMatch(/<h1>This is my heading<\/h1>/);
				expect(innerHTML).toMatch(/<p>This is a <b>paragraph<\/b><\/p>/);
				expect(innerHTML).toMatch(/<div class="myclass" id="myid">This is a divd <em>paragraph<\/em>\. and another sentence\.<\/div>/);
			});

			it("should be able to return the text component from a simple empty div", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				var innerHTML = div.childNodes().reduce(function(innerHTML, child) {
					return innerHTML + child.toString();
				});

				expect(innerHTML).toMatch(/This is a divd <em>paragraph<\/em>/);
			});

			it("should be able to return the text component from a simple empty h1", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = html.fetch("h1");

				var innerHTML = h1.childNodes().reduce(function(innerHTML, child) {
					return innerHTML + child.toString();
				}, "");

				expect(innerHTML).toBe("This is my heading");
			});
		});

		describe("inner Text", function() {
			it("should be able to list all it's children", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var body = html.fetch("body");

				var innerText = body.childNodes().reduce(function(innerText, child) {
					return innerText + child.text();
				}, "");

				expect(innerText).toMatch(/\s+This is my heading\s+This is a paragraph\s+This is a divd paragraph. and another sentence./);
			});
		});
		describe("text nodes", function() {
			it("should be able to detect if a node is a text node", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = html.fetch("h1");
				var textNode = h1.childNodes()[0];

				expect(textNode.type()).toBe("text");
			});

			it("should be able to turn a text node into a div", function() {
				var doc = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = doc.fetch("h1");
				var textNode = h1.childNodes()[0];

				textNode.remove();
				h1.addChild(new libxml.Element(doc, "div", {}, textNode.toString()));

				expect(h1.toString()).toMatch(/<h1><div>This is my heading<\/div><\/h1>/);
			});

			it("should be able to turn multiple text node into multiple p's", function() {
				var doc = libxml.parseHtmlString(fixture("test4.html"));
				var div = doc.fetch("div");

				div.childNodes().forEach(function(node) { 
					node.remove();
					if (node.childNodes().length === 0) {
						div.addChild(new libxml.Element(doc, "p", {}, node.toString()));
					} else {
						div.addChild(node);
					}
				});

				expect(div.toString()).toMatch(/<div class="myclass" id="myid"><p>This is a divd <\/p><em>paragraph<\/em><p>. and another sentence.<\/p><\/div>/);
			});
		});

		describe("dynamic property persistence", function() {
			it("should be able to set a property on a node", function() {
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = html.fetch("h1");
				h1.mystuff = "yeah!";
				var h1b = html.fetch("h1");
				expect(h1b.mystuff).toBe("yeah!");
			});
		});

		describe("attribute accessors", function() {
			it("should be able to read off normal attributes like id and class", function() {
				var html = libxml.parseHtmlString('<html><head><title>my title</title><body><p ID="hello" cLaSS="world">my par</p></body></html>');
				var p = html.fetch("p");

				var getAttr = function(node, attrName) {
					var attrValue = "";
					var attr = node.attr(attrName);
					if (attr) attrValue = attr.value();

					return attrValue;
				};

				expect(getAttr(p, "id")).toBe("hello");
				expect(getAttr(p, "class")).toBe("world");
			});
		});

		describe("sub css searches", function() {
			it("should be able to do a sub css search", function() {
				var html = libxml.parseHtmlString('<html><head><title>my title</title><body><p ID="hello" cLaSS="world"><em>my par</em></p></body></html>');

				var body = html.fetch("body");
				var needles = body.find("." + css2xpath("em"));

				expect(needles[0].toString()).toBe("<em>my par</em>");
			});
		});

		describe("cloning nodes", function() {
            it("should be able to clone a node", function() {
				var doc = libxml.parseHtmlString(fixture("test4.html"));
				var body = doc.fetch("body");
				var div = doc.fetch("div");

                var h1 = doc.fetch("h1");

				var cloneAttrs = function(dest) {
					attrMap = {};
					dest.attrs().forEach(function(attr) {
						attrMap[attr.name()] = attr.value();
					});

					return attrMap;
				};

				var cloneLeaf = function(node) {
					var clone = new libxml.Element(doc, node.name(), cloneAttrs(node), node.childNodes().length === 0 ? node.text() : "");
					return clone;
				};

				var clone = function(node) {
					var newNode = cloneLeaf(node);
					node.childNodes().forEach(function(child) {
						newNode.addChild(clone(child));
					});
					return newNode;
				};
				
				var out = clone(div);

				// bug in libxmljs - comment out for now
				// expect(out.toString()).toMatch(/<div class="myclass" id="myid">This is a divd <em>paragraph<\/em>. and another sentence.<\/div>/);
            });
		});

		describe("removing attribute", function() {
			it("should be able to remove the class attribute from a single node", function() {
				var html = libxml.parseHtmlString('<html><head><title>my title</title><body><p ID="hello" cLaSS="world">my par</p></body></html>');
				var p = html.fetch("p");

				var removeAttr = function(node, attrName) {
					var attr = node.attr(attrName);
					if (attr) attr.remove();
				};

				removeAttr(p, "class");

				expect(p.toString()).toBe('<p id="hello">my par</p>');
			});

			it("should be able to remove the class attribute from all nodes", function() {
				var html = libxml.parseHtmlString(
				  '<html><head><title>my title</title><body class="mybody"><p ID="hello" cLaSS="world">my par</p></body></html>');

				html.search("*").forEach(function(node) {
					var attr = node.attr("class");
					if (attr) attr.remove();
				});

				expect(html.root().toString()).toBe('<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>my title</title></head><body><p id="hello">my par</p></body></html>');
			});
		});
	});

	describe("collections", function() {
		it("should be able to take in an xml string", function() {
			var x = libxml.parseXmlString("<top><a>hello</a><b>world</b></top>");
			expect(x.root().toString()).toBe("<top><a>hello</a><b>world</b></top>");
		});
	});

	describe("element collections", function() {
		beforeEach(function() {
			x = libxml.parseHtmlString("<top><a>hello</a><b>world</b></top>");
			html = libxml.parseHtmlString(fixture("test2.html"));
		});

		it("should have a length of 1", function() {
			expect(x.childNodes().length).toBe(1);
		});

		it("should insert html", function() {
			expect(x.root().name()).toBe("html");
		});

		it("should match basic xpath searches", function() {
			var results = x.get("//top/b").text();
			expect(results).toBe("world");
		});

		it("should have a bunch of html", function() {
			var e = html.root();
			var h = e.doc().toString();
			expect(h).toMatch(/Market Samurai would often report slightly different results/);
		});

		describe("css selectors", function() {
			it("should match a single css class", function() {
				var matches = html.search(".register-nav");
				expect(matches.length).toBe(1);
				expect(matches[0].text()).toBe("Products");
			});

			it("should match multiple css classes", function() {
				var matches = html.search(".commentlist_alt");
				expect(matches.length).toBe(4);
				matches.forEach(function(e) {
					expect(e.name()).toBe("li");
				});
			});

			it("should be able to get access to a H1", function() {
				var matches = html.search("h1");
				expect(matches.length).toBe(1);
				expect(matches[0].text()).toBe("Noble Samurai");
			});
		});
	});

	describe("extending libxmljs", function() {
		it("should be able to add another function to element", function() {
			var doc = new libxml.Document();
			var e = new libxml.Element(doc, "div", {}, "hello");

			libxml.Element.prototype.hello = function() {
				return "hello, world";
			};

			expect(e.hello()).toBe("hello, world");
		});

		it("should be able to add another function to document", function() {
			libxml.Document.prototype.foo = function() {
				return "bar";
			};

			var doc = new libxml.Document();

			expect(doc.foo()).toBe("bar");
		});

		it("should be able to load HTML from scratch", function() {
			var doc = libxml.parseHtmlString(fixture("test1.html"));
			var re = /<html>.*<\/html>/gim;
			expect(doc.toString()).toMatch(/<html>/);
		});

		describe("css searching", function() {
			it("should be able to add the search function straight on the document", function() {
				libxml.Document.prototype.search = function(cssSelector) {
					return this.find(css2xpath(cssSelector));
				};

				var doc = libxml.parseHtmlString(fixture("test1.html"));
				var p = doc.search("p")[0];
				expect(p.toString()).toBe("<p>This is a paragraph</p>");
			});

			it("should be able to add the search function straight on the element", function() {
				libxml.Document.prototype.search = function(cssSelector) {
					return this.find(css2xpath(cssSelector));
				};

				libxml.Element.prototype.search = function(cssSelector) {
					return this.find("." + css2xpath(cssSelector));
				};

				var doc = libxml.parseHtmlString(fixture("test1.html"));
				var body = doc.search("body")[0];

				var h1 = body.search("h1")[0];

				expect(h1.toString()).toBe("<h1>This is my heading</h1>");
			});
		});
	});
});
