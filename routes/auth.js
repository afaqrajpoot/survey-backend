var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.get("/", AuthController.userList);
router.get("/:id", AuthController.userDetail);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyConfirm);
router.post("/resend-verify-otp", AuthController.resendConfirmOtp);

module.exports = router;