var express = require("express");
var router = express.Router();
let bcrypt = require('bcrypt')
let userModel = require("../schemas/users");
let roleModel = require("../schemas/roles");
let { validatedResult, CreateAnUserValidator, ModifyAnUserValidator } = require('../utils/validator')
let userController = require('../controllers/users')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { uploadExcel } = require('../utils/uploadHandler')


router.get("/", CheckLogin, checkRole("ADMIN","MODERATOR"), async function (req, res, next) {//ADMIN
  let users = await userController.GetAllUser()
  res.send(users);
});

router.get("/:id", async function (req, res, next) {
  let result = await userController.GetUserById(
    req.params.id
  )
  if (result) {
    res.send(result);
  } else {
    res.status(404).send({ message: "id not found" })
  }
});

router.post("/", CreateAnUserValidator, validatedResult, async function (req, res, next) {
  
  try {
    let user = await userController.CreateAnUser(
      req.body.username, req.body.password,
      req.body.email, req.body.role
    )
    res.send(user);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put("/:id", ModifyAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate
      (id, req.body, { new: true });

    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    let populated = await userModel
      .findById(updatedItem._id)
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Route import user từ file XLSX
router.post("/import-from-xlsx", CheckLogin, checkRole("ADMIN"), uploadExcel.single('file'), async function (req, res, next) {
  try {
    // Kiểm tra file
    if (!req.file) {
      return res.status(400).send({ message: "Vui lòng chọn file Excel" });
    }

    // Lấy role "user" từ database
    let userRole = await roleModel.findOne({ name: "user" });
    
    if (!userRole) {
      // Nếu không có role "user", trả lỗi
      if (req.file) {
        let fs = require('fs');
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {}
      }
      return res.status(400).send({ message: "Không tìm thấy role 'user' trong hệ thống" });
    }

    // Import user từ file
    let results = await userController.ImportUserFromXLSX(req.file.path, userRole._id);
    
    res.send({
      message: "Import hoàn tất",
      summary: {
        total: results.total,
        success: results.success.length,
        failed: results.failed.length
      },
      details: {
        success: results.success,
        failed: results.failed
      }
    });

  } catch (err) {
    // Xóa file nếu có lỗi
    if (req.file) {
      let fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;