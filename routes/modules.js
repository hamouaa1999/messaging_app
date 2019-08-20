var express = require("express"),
	user = require("../models/user"),
	Module = require("../models/module"),
	router = express.Router();

router.get("/messagerie/modules/new", isAdminLoggedIn, (request, response) => {
	response.render("modules/new");
});

router.get("/messagerie/modules", (request, response) => {
	Module.find({}, function(error, foundModules) {
		if (error) {
			//handling the error
			console.log(error);
		} else {
			response.render("general/home", {modules: foundModules});
		}
	});
});

router.get("/messagerie/modules/:id/messages", (request, response) => {
	Module.findById(request.params.id).populate("messages").exec((error, foundModule) => {
		if (error) {
			//handling the error
			console.log(error);
		} else {
			response.render("general/module", {module: foundModule});
		}
	});
});

router.get("/messagerie/modules/:id/images", (request, response) => {
	Module.findById(request.params.id, (error, foundModule) => {
		if (error) {
			//handling the error
			console.log(error);
		} else {
			response.render("images/images");
				
		}
	})
	
});





router.get("/apropos", (request, response) => {
	response.render("apropos");
});



router.post("/messagerie/modules/new", isAdminLoggedIn, (request, response) => {
	var author = {
		id: request.user._id,
		username: request.user.username
	}
	var messages = []
	var newModule = {
		name: request.body.name, 
		author: author,
		messages: messages,
		description: request.body.description,
		enseignant: request.body.enseignant 
	}
	Module.create(newModule, (error, NewModule) => {
		if (error) {
			//handling the error
			console.log(error);
		} else {
			Module.find({}, (error, foundModules) => {
				if (error) {
					//handling the error
					console.log(error);
				} else {
					response.redirect("/messagerie/modules");
				}
			});
			
		}
	});
});

router.post("/messagerie/modules/:id/messages", (request, response) => {
	Module.findById(request.params.id, (error, foundModule) => {
		if (error) {
			//handling the error
			console.log(error);
		} else {
			var newMessage = new message({
				author: {
					id: request.user._id,
					username: request.user.username
				},
				text: request.body.message,
				image: request.body.image
			});
			newMessage.save();
			foundModule.messages.push(newMessage);
			foundModule.save();
			response.redirect("back");
		}
	});
});

router.post("/messagerie/users/delete", (request, response) => {
	user.findByIdAndRemove(request.user._id, (error) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Deleted successfully");
			response.redirect("/messagerie/login");
		}
	});
});

router.post("/messagerie/conversations/:id/delete", (request, response) => {
	Module.findById(request.params.id, (error, foundModule) => {
		if (error) {
			//handling the error
			console.log(error);
		} else {
			foundModule.messages = [];
			foundModule.save();
			response.redirect("/messagerie/modules/" + request.params.id + "/messages");
		}
	});
});


function isAdminLoggedIn(request, response, next) {
	if (request.isAuthenticated()) {
		next();													
	} else {
		//permission required
		response.redirect("/messagerie/login");
	}
}

module.exports = router;