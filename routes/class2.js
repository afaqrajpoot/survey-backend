var express = require("express");
const ClassController2 = require("../controllers/ClassController2");

var router = express.Router();

router.get("/", ClassController2.classList);
router.get("/:id", ClassController2.classDetail);
router.post("/", ClassController2.classStore);
router.put("/:id", ClassController2.classUpdate);
router.delete("/:id", ClassController2.classDelete);

module.exports = router;