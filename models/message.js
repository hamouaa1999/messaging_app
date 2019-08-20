var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user"
		},
		username: String
	},
	text: String,
	image: String
});


module.exports = mongoose.model("message", messageSchema);