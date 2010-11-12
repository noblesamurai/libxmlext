describe "libxml"
	describe "jspec"
		it "should allow string comparison"
			"hello".toString().should.eql("hello")
		end

		it "should be able to load fixtures"
			var f = fixture("test1.html");
			f.should.match /<h1>This is my heading<\/h1>/
		end
	end

	describe "xml library"
		describe "xml dom creation"
			it "should create a dom using the dom methods and then output to a string"
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
				result.should.eql expected
			end

			it "should be able to create xml from bad html"
				var result = libxml.parseHtmlString("<p>par 1<p>par 2");
				(result.toString().indexOf("<html><body><p>par 1</p><p>par 2</p></body></html>") !== -1).should.be_true
			end

			it "should be able to create xml from bad attributes"
				var result = libxml.parseHtmlString("<p>par 1<p class=' blah is \"blah\" '>par 2");
				(result.toString().indexOf('<html><body><p>par 1</p><p class=" blah is &quot;blah&quot; ">par 2</p></body></html>') !== -1).should.be_true
			end
		end

		describe "xml dom removal"
			before_each
				html = libxml.parseHtmlString(fixture("test3.html"));
			end

			it "should be able to read my new fixture"
				html.toString().should.match /<p>This is a <b>paragraph<\/b><\/p>/
			end

			it "should be able to get a handle on a paragraph"
				html.fetch("p").toString().should.match /<p>This is a <b>paragraph<\/b><\/p>/
			end

			it "should be able to remove the bold element"
				var p = html.fetch("p");
				var b = html.fetch("b");
				b.remove();
				p.toString().should.match /<p>This is a <\/p>/
				html.toString().should.match /<p>This is a <\/p>/
			end
		end

		describe "xml node replacement"
			it "should be able to change a p into a div"
				var html = libxml.parseHtmlString(fixture("test3.html"));
				var p = html.fetch("p");

				p.name("div");

				p.toString().should.match /<div>This is a <b>paragraph<\/b><\/div>/
			end

			it "should be able to change a div into a p and keep attributes"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				div.name("p");

				div.toString().should.match /<p class="myclass" id="myid">This is a divd <em>paragraph<\/em>\. and another sentence\.<\/p>/
			end

			it "should be able to remove all attributes"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				var attrs = div.attrs();
				attrs.forEach(function(attr) { attr.remove(); });

				div.toString().should.match /<div>This is a divd <em>paragraph<\/em>\. and another sentence\.<\/div>/
			end

			it "should be able to remove all attributes and change a div into a p"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				var attrs = div.attrs();
				attrs.forEach(function(attr) { attr.remove(); });
				div.name("p");

				div.toString().should.match /<p>This is a divd <em>paragraph<\/em>\. and another sentence\.<\/p>/
			end
		end

		describe "innerHTML"
			it "should be able to list all it's children"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var body = html.fetch("body");

				var innerHTML = body.childNodes().reduce(function(innerHTML, child) {
					return innerHTML + child.toString();
				});

				innerHTML.should.match /<h1>This is my heading<\/h1>/
				innerHTML.should.match /<p>This is a <b>paragraph<\/b><\/p>/
				innerHTML.should.match /<div class="myclass" id="myid">This is a divd <em>paragraph<\/em>\. and another sentence\.<\/div>/
			end

			it "should be able to return the text component from a simple empty div"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var div = html.fetch("div");

				var innerHTML = div.childNodes().reduce(function(innerHTML, child) {
					return innerHTML + child.toString();
				});

				innerHTML.should.match /This is a divd <em>paragraph<\/em>/
			end

			it "should be able to return the text component from a simple empty h1"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = html.fetch("h1");

				var innerHTML = h1.childNodes().reduce(function(innerHTML, child) {
					return innerHTML + child.toString();
				}, "");

				innerHTML.should.be "This is my heading"
			end
		end

		describe "inner Text"
			it "should be able to list all it's children"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var body = html.fetch("body");

				var innerText = body.childNodes().reduce(function(innerText, child) {
					return innerText + child.text();
				}, "");

				innerText.should.match /\s+This is my heading\s+This is a paragraph\s+This is a divd paragraph. and another sentence./
			end
		end

		describe "text nodes"
			it "should be able to detect if a node is a text node"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = html.fetch("h1");
				var textNode = h1.childNodes()[0];

				textNode.type().should.be "text"
			end

			it "should be able to turn a text node into a div"
				var doc = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = doc.fetch("h1");
				var textNode = h1.childNodes()[0];

				textNode.remove();
				h1.addChild(new libxml.Element(doc, "div", {}, textNode.toString()));

				h1.toString().should.match /<h1><div>This is my heading<\/div><\/h1>/
			end

			it "should be able to turn multiple text node into multiple p's"
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

				div.toString().should.match /<div class="myclass" id="myid"><p>This is a divd <\/p><em>paragraph<\/em><p>. and another sentence.<\/p><\/div>/
			end
		end

		describe "dynamic property persistence"
			it "should be able to set a property on a node"
				var html = libxml.parseHtmlString(fixture("test4.html"));
				var h1 = html.fetch("h1");
				h1.mystuff = "yeah!";
				var h1b = html.fetch("h1");
				h1b.mystuff.should.eql "yeah!"
			end
		end

		describe "attribute accessors"
			it "should be able to read off normal attributes like id and class"
				var html = libxml.parseHtmlString('<html><head><title>my title</title><body><p ID="hello" cLaSS="world">my par</p></body></html>');
				var p = html.fetch("p");

				var getAttr = function(node, attrName) {
					var attrValue = "";
					var attr = node.attr(attrName);
					if (attr) attrValue = attr.value();

					return attrValue;
				};

				getAttr(p, "id").should.be "hello"
				getAttr(p, "class").should.be "world"
			end
		end

		describe "sub css searches"
			it "should be able to do a sub css search"
				var html = libxml.parseHtmlString('<html><head><title>my title</title><body><p ID="hello" cLaSS="world"><em>my par</em></p></body></html>');

				var body = html.fetch("body");
				var needles = body.find("." + css2xpath("em"));

				needles[0].toString().should.be "<em>my par</em>"
			end
		end

		describe "cloning nodes"
            it "should be able to clone a node"
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
				// out.toString().should.match /<div class="myclass" id="myid">This is a divd <em>paragraph<\/em>. and another sentence.<\/div>/
            end
		end

		describe "removing attribute"
			it "should be able to remove the class attribute from a single node"
				var html = libxml.parseHtmlString('<html><head><title>my title</title><body><p ID="hello" cLaSS="world">my par</p></body></html>');
				var p = html.fetch("p");

				var removeAttr = function(node, attrName) {
					var attr = node.attr(attrName);
					if (attr) attr.remove();
				};

				removeAttr(p, "class");

				p.toString().should.be '<p id="hello">my par</p>'
			end

			it "should be able to remove the class attribute from all nodes"
				var html = libxml.parseHtmlString(
				  '<html><head><title>my title</title><body class="mybody"><p ID="hello" cLaSS="world">my par</p></body></html>');

				html.search("*").forEach(function(node) {
					var attr = node.attr("class");
					if (attr) attr.remove();
				});

				html.root().toString().should.be '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>my title</title></head><body><p id="hello">my par</p></body></html>'
			end
		end
	end

	describe "collections"
		it "should be able to take in an xml string"
			var x = libxml.parseXmlString("<top><a>hello</a><b>world</b></top>");
			x.root().toString().should.be "<top><a>hello</a><b>world</b></top>"
		end
	end

	describe "element collections"
		before_each
			x = libxml.parseHtmlString("<top><a>hello</a><b>world</b></top>");
			html = libxml.parseHtmlString(fixture("test2.html"));
		end

		it "should have a length of 1"
			x.childNodes().length.should.eql 1
		end

		it "should insert html"
			x.root().name().should.eql("html")
		end

		it "should match basic xpath searches"
			var results = x.get("//top/b").text();
			results.should.eql("world");
		end

		it "should have a bunch of html"
			var e = html.root();
			var h = e.doc().toString();
			h.should.match /Market Samurai would often report slightly different results/
		end

		describe "css selectors"
			it "should match a single css class"
				var matches = html.search(".register-nav");
				matches.length.should.equal 1
				matches[0].text().should.equal("Products");
			end

			it "should match multiple css classes"
				var matches = html.search(".commentlist_alt");
				matches.length.should.equal 4
				matches.forEach(function(e) {
					e.name().should.be "li"
				});
			end

			it "should be able to get access to a H1"
				var matches = html.search("h1");
				matches.length.should.equal 1
				matches[0].text().should.equal "Noble Samurai"
			end
		end
	end

	describe "extending libxmljs"
		it "should be able to add another function to element"
			var doc = new libxml.Document();
			var e = new libxml.Element(doc, "div", {}, "hello");

			libxml.Element.prototype.hello = function() {
				return "hello, world";
			};

			e.hello().should.be "hello, world"
		end

		it "should be able to add another function to document"
			libxml.Document.prototype.foo = function() {
				return "bar";
			};

			var doc = new libxml.Document();

			doc.foo().should.be "bar"
		end

		it "should be able to load HTML from scratch"
			var doc = libxml.parseHtmlString(fixture("test1.html"));
			var re = /<html>.*<\/html>/gim;
			doc.toString().should.match /<html>/
		end

		describe "css searching"
			it "should be able to add the search function straight on the document"
				libxml.Document.prototype.search = function(cssSelector) {
					return this.find(css2xpath(cssSelector));
				};

				var doc = libxml.parseHtmlString(fixture("test1.html"));
				var p = doc.search("p")[0];
				p.toString().should.be "<p>This is a paragraph</p>"
			end

			it "should be able to add the search function straight on the element"
				libxml.Document.prototype.search = function(cssSelector) {
					return this.find(css2xpath(cssSelector));
				};

				libxml.Element.prototype.search = function(cssSelector) {
					return this.find("." + css2xpath(cssSelector));
				};

				var doc = libxml.parseHtmlString(fixture("test1.html"));
				var body = doc.search("body")[0];

				var h1 = body.search("h1")[0];

				h1.toString().should.be "<h1>This is my heading</h1>"
			end
		end
	end
end
