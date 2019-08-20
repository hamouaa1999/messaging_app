var express = require("express"),
	passport = require("passport"),
	user = require("../models/user"),
	router = express.Router();

router.get("/messagerie/register", (request, response) => {
	response.render("authentication/register");
});

router.get("/messagerie/login", (request, response) => {
	response.render("authentication/login");
});

router.get("/messagerie/logout", (request, response) => {
	request.logout();
	response.redirect("/messagerie");
});

router.post("/messagerie/register", (request, response) => {
	user.register(new user({username: request.body.username}), request.body.password, (error, user) => {
		if (error) {
			//error Handling
			return response.render("authentication/register");
		} else {
			passport.authenticate("local")(request, response, () => {
				response.redirect("/messagerie");
			});
		}
	});
});

router.post("/messagerie/login", passport.authenticate("local", {
	successRedirect: "/messagerie/modules",
	failureRedirect: "/messagerie/login"
}), (request, response) => {

});

module.exports = router;