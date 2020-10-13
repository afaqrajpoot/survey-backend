const Student = require("../models/StudentModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Book Schema
function StudentData(data) {
	this.id = data._id;
	this.behavior= data.behavior;
	this.studentNumber = data.studentNumber;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */
exports.studentList = [
	auth,
	function (req, res) {
		try {
			Student.find({user: req.user._id},"_id title description isbn createdAt").then((student)=>{
				if(student.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", student);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.studentDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Student.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((student)=>{
				if(student !== null){
					let studentData = new StudentData(student);

					return apiResponse.successResponseWithData(res, "Operation success", studentData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.studentStore = [
	auth,
	body("studentNumber", "student Number must not be empty.").isLength({ min: 1 }).trim(),
	body("behavior", "behavior must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Student.findOne({behavior : value,user: req.user._id}).then(student => {
			if (student) {
				return Promise.reject("Book already exist with this behavior no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var student = new Student(
				{ studentNumber: req.body.studentNumber,
					behavior: req.behavior,
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				student.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let studentData = new StudentData(student);
					return apiResponse.successResponseWithData(res,"Book add Success.", studentData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}

	}
];

/**
 * Book update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.studentUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Student.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(student => {
			if (student) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var student = new Student(
				{ title: req.body.title,
					description: req.body.description,
					isbn: req.body.isbn,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Student.findById(req.params.id, function (err, foundStudent) {
						if(foundStudent === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							//Check authorized user
							if(foundStudent.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								Student.findByIdAndUpdate(req.params.id, student, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let bookData = new StudentData(student);
										return apiResponse.successResponseWithData(res,"Book update Success.", bookData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.studentDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Student.findById(req.params.id, function (err, foundStudent) {
				if(foundStudent === null){
					return apiResponse.notFoundResponse(res,"Book not exists with this id");
				}else{
					//Check authorized user
					if(foundStudent.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Student.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Book delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];