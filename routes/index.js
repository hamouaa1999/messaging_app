var express = require("express"),
	router = express.Router();

router.get("/", (request, response) => {
	response.redirect("/messagerie");
});

router.get("/messagerie", (request, response) => {
	response.render("general/landing");
});

module.exports = router;