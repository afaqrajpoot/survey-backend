const Classs = require("../models/ClassModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * Book List.
 *
 * @returns {Object}
 */
exports.classList = [
	auth,
	function (req, res) {
		try {
			Classs.find({user: req.user._id}).then((classs)=>{
				if(classs.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", classs).limit(2);
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

// Book Schema
function ClassData(data) {
	this.date = data.date;
	this.title= data.title;
	this.teacher = data.teacher;
	this.startTime = data.startTime;
	this.endTime = data.endTime;
	this.numberOfStudents = data.numberOfStudents;
	this.topic = data.topic;
	this.subject = data.subject;
}

/**
 * Book Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.classDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Classs.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((classs)=>{
				if(classs !== null){
					let classData = new ClassData(classs);

					return apiResponse.successResponseWithData(res, "Operation success", classData);
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
exports.classsStore = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("subject", "subject must not be empty.").isLength({ min: 1 }).trim(),
	body("date", "date must not be empty.").isLength({ min: 1 }).trim(),
	body("startTime", "Start time must not be empty.").isLength({ min: 1 }).trim(),
	body("endTime", "end Time must not be empty.").isLength({ min: 1 }).trim(),
	body("subject", "subject must not be empty.").isLength({ min: 1 }).trim(),
	body("teacher", "teacher must not be empty.").isLength({ min: 1 }).trim(),
	body("numberOfStudents", "Students must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Classs.findOne({isbn : value,user: req.user._id}).then(classs => {
			if (classs) {
				return Promise.reject("class already exist with this ISBN no.");
			}
		});
	}),

	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var classs = new Classs(
				{ date : req.date,
					title : req.title,
					teacher : req.teacher,
					startTime : req.startTime,
					endTime : req.endTime,
					numberOfStudents : req.numberOfStudents,
					topic : req.topic,
					subject : req.subject
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				classs.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let classData = new ClassData(classs);
					return apiResponse.successResponseWithData(res,"Class add Success.", classData);
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
exports.classUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Classs.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(classs => {
			if (classs) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var classs = new Classs(
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
					Classs.findById(req.params.id, function (err, foundBook) {
						if(foundBook === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							//Check authorized user
							if(foundBook.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								classs.findByIdAndUpdate(req.params.id, classs, {},function (err) {
									if (err) {
										return apiResponse.ErrorResponse(res, err);
									}else{
										let classData = new ClassData(classs);
										return apiResponse.successResponseWithData(res,"Book update Success.", classData);
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
exports.classDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Classs.findById(req.params.id, function (err, foundClass) {
				if(foundClass === null){
					return apiResponse.notFoundResponse(res,"Book not exists with this id");
				}else{
					//Check authorized user
					if(foundClass.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Classs.findByIdAndRemove(req.params.id,function (err) {
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