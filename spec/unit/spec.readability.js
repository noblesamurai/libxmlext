describe "readability"
	before_each
		html = fixture("test2.html");
	end

	it "should be able to access the readability library"
		readability.should.not.be_undefined
	end

	describe "getArticleTitle"
		it "should work properly with article title with pipes"
			var title = readability.getArticleTitle(fixture("test2.html"));
			title.should.be "Improved Regional Keyword Targeting"
		end

		it "should work properly with article title, less than 3 words, with pipes"
			var title = readability.getArticleTitle(fixture("title-pipe.html"));
			title.should.be "Noble Samurai"
		end

		it "should work properly with article title with colons"
			var title = readability.getArticleTitle(fixture("title-colon.html"));
			title.should.be "Noble Samurai"
		end

		it "should work properly with article title, less than 3 words, with colons"
			var title = readability.getArticleTitle(fixture("title-colon-short.html"));
			title.should.be "Improved Keyword Research Module : Noble"
		end

		it "should work with long articles where it looks for a h1"
			var long="<html><head><title>" + 
					 "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor varius urna ac sodales. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis amet." + 
					 "</title><body><h1>My H1 is here</h1></body></html>";

			var title = readability.getArticleTitle(long);
			title.should.be "My H1 is here"
		end
	end

	describe "grabArticle"
		it "should be able to call the grabArticle function"
			var body = readability.grabArticle(html);
			body.should.not.be_undefined
		end

		it "should be able to call the grabArticle function and get back some text"
			var title = readability.getArticleTitle(html);
			var body = readability.grabArticle(html);

			title.should.be "Improved Regional Keyword Targeting"
			body.should.match /<p>Hello Samurai,<\/p>/
		end
	end

	describe "parseDocument"
		it "should be able to call the parseDocument function"
			var doc = readability.parseDocument(html);

			doc.title.should.be "Improved Regional Keyword Targeting"
			doc.articleHtml.should.match /<p>Hello Samurai,<\/p>/
			doc.articleText.should.match /In the recent batch of updates,/
		end
	end
end
