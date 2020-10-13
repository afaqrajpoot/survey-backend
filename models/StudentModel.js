var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
	studentNumber: {type: String, required: true},
	behavior: {type: String, required: true},
}, {timestamps: true});

// Virtual for user's full name

module.exports = mongoose.model("Student", StudentSchema);