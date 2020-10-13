const Class = require("../models/ClassModel2");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Book Schema
function ClassData(data) {
	this.id = data._id;
	this.title= data.title;
	this.date = data.date;
	this.teacher = data.teacher;
	this.survey = data.survey;
	this.createdAt = data.createdAt;
	this.startTime = data.startTime;
	this.endTime = data.endTime;
	this.subject = data.subject;
	this.topic = data.topic;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */
exports.classList = [
	auth,
	function (req, res) {
		try {
			Class.find({user: req.user._id}).skip(2).limit(1).then((classs)=>{
				if(classs.length > 0){
					return apiResponse.successResponseWithData(res, "Operation succcess", classs);
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
exports.classDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Class.findOne({_id: req.params.id,user: req.user._id}).then((classs)=>{
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
exports.classStore = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("date", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("teacher", "ISBN must not be empty").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			/*let dataArr = [];
			foreach(req.body.survey as item){
				dataArr.push(item);
			}*/
		//	console.log(typeof req.body.survey);
			const errors = validationResult(req);
			var classs = new Class(
				{ title: req.body.title,
					startTime: req.body.startTime,
					endTime: req.body.endTime,
					date: req.body.date,
					subject: req.body.subject,
					topic: req.body.topic,
					teacher: req.body.teacher,
					user: req.user._id,
					survey : req.body.survey.split(',')
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				classs.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let classData = new ClassData(classs);
					return apiResponse.successResponseWithData(res,"Book add Success.", classData);
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
	body("date", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("teacher", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Class.findOne({teacher : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(classs => {
			if (classs) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var classs = new Class(
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
					Class.findById(req.params.id, function (err, foundClass) {
						if(foundClass === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							//Check authorized user
							if(foundClass.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								Class.findByIdAndUpdate(req.params.id, classs, {},function (err) {
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
			Class.findById(req.params.id, function (err, foundClass) {
				if(foundClass === null){
					return apiResponse.notFoundResponse(res,"Book not exists with this id");
				}else{
					//Check authorized user
					if(foundClass.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Class.findByIdAndRemove(req.params.id,function (err) {
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