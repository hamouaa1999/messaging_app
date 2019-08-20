var mongoose = require("mongoose");

var moduleSchema = new mongoose.Schema({
	name: String,
	admin: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user"
		},
		username: String
	},
	messages: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "message"}
	],
	description: String,
	enseignant: String

});

module.exports = mongoose.model("Module", moduleSchema);