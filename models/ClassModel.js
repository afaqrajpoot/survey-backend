var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ClassSchema = new mongoose.Schema({
	title: {type: String, required: true},
	date: {type: String, required: true},
	startTime: {type: String, required: true},
	endTime: {type: String, required:true},
	subject: {type: String, required: true},
	teacher: {type: String, required: true},
	topic: {type: String, required: true},
	numberOfStudents: {type: Number, required:false},
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

// Virtual for user's full name


module.exports = mongoose.model("Classs", ClassSchema);