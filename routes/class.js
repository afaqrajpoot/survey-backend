var express = require("express");
const ClassController = require("../controllers/ClassController");

var router = express.Router();

router.get("/", ClassController.classList);
router.get("/:id", ClassController.classDetail);
router.post("/", ClassController.classsStore);
router.put("/:id", ClassController.classUpdate);
router.delete("/:id", ClassController.classDelete);

module.exports = router;