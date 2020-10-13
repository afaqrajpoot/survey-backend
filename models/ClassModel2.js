var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ClassSchema = new Schema({
	title: {type: String, required: true},
	date: {type: String, required: true},
	startTime: {type: String, required: true},
	endTime: {type: String, required: true},
	subject: {type: String, required: true},
	topic: {type: String, required: true},
	teacher: {type: String, required: true},
	survey: {type: Array, required: true},
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

module.exports = mongoose.model("Class", ClassSchema);