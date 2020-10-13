var express = require("express");
const StudentController = require("../controllers/StudentController");

var router = express.Router();

router.get("/", StudentController.studentList);
router.get("/:id", StudentController.studentDetail);
router.post("/", StudentController.studentStore);
router.put("/:id", StudentController.studentUpdate);
router.delete("/:id", StudentController.studentDelete);

module.exports = router;