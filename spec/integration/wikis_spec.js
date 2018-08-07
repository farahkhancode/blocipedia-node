
const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require('../../src/db/models/index').sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {

//member user context
   beforeEach((done) => {
     this.user;
     this.wiki;
     sequelize.sync({force: true}).then((res) => {

      User.create({
      username: "sampleusername",
      email: "user@example.com",
      password: "1234567890"
    })
         .then((user) => {
           this.user = user;
            request.get({
                  url: "http://localhost:3000/auth/fake",
                  form: {
                    userId: user.id,
                    email: user.email
              }
          });
          Wiki.create({
             title: "Benefits of turmeric",
             body: "One benefit of turmeric is digestion.",
             userId: this.user.id
           })
           .then((wiki) => {
             this.wiki = wiki;
             done();
           });
         })
         .catch((err) => {
           console.log(err);
           done();
         });
       });
     });

    describe("GET /wikis", () => {
        it("should render a view with a all wikis and status code 200", (done) => {
          request.get(base, (err, res, body) => {
            expect(res.statusCode).toBe(200);
            expect(err).toBeNull();
            expect(body).toContain("Wikis");
            done();
          });
        });
      });

     describe("GET /wikis/new", () => {
        it("should render a view with a new wiki form", (done) => {
          request.get(`${base}new`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("New Wiki");
            done();
          });
        });
      });

    describe("POST /wikis/create", () => {
     it("should create a new wiki and redirect", (done) => {
       const options = {
         url: `${base}create`,
         form: {
           title: "blink-182 songs",
           body: "What's your favorite blink-182 song?",
           private: true,
           userId: this.user.id
         }
       };
       request.post(options,
         (err, res, body) => {
           Wiki.findOne({where: {title: "blink-182 songs"}})
          .then((wiki) => {
            expect(wiki.title).toBe("blink-182 songs");
            expect(wiki.body).toBe("What's your favorite blink-182 song?");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });
  });

  describe("GET /wikis/:id", () => {
   it("should render a view with the selected wiki", (done) => {
     request.get(`${base}${this.wiki.id}`, (err, res, body) => {
       expect(err).toBeNull();
       expect(body).toContain("One benefit of turmeric is digestion.");
       done();
     });
   });
 });

 describe("POST /wikis/:id/destroy", () => {
    it("should delete the wiki with the associated ID", (done) => {
      Wiki.all()
      .then((wikis) => {
        const wikiCountBeforeDelete = wikis.length;
        expect(wikiCountBeforeDelete).toBe(1);
        request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
          Wiki.all()
          .then((wikis) => {
            expect(err).toBeNull();
            expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        });
      })
    });
  });


  describe("GET /wikis/:id/edit", () => {
     it("should render a view with an edit wiki form", (done) => {
       request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Edit Wiki");
         expect(body).toContain("One benefit of turmeric is digestion.");
         done();
       });
     });
   });


  describe("POST /wikis/:id/update", () => {
    it("should update the wiki with the given values", (done) => {
      request.post({
        url: `${base}${this.wiki.id}/update`,
        form: {
          title: "JavaScript Frameworks",
          body: "There are a lot of them",
          userId: this.user.id
        }
      }, (err, res, body) => {
        expect(err).toBeNull();
        Wiki.findOne({
          where: {id:1}
        })
        .then((wiki) => {
          expect(wiki.title).toBe("JavaScript Frameworks");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });


  // context of member user

});