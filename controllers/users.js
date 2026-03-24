let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs')
let ExcelJS = require('exceljs');
let { sendPasswordEmail } = require('../utils/sendMail');
let { generateRandomPassword } = require('../utils/passwordGenerator');

module.exports = {
    CreateAnUser: async function (username, password, email, role, session, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save({ session });
        return newItem;
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false })
    },
    GetUserById: async function (id) {
        try {
            return await userModel
                .findOne({
                    isDeleted: false,
                    _id: id
                }).populate('role')
        } catch (error) {
            return false;
        }
    },
    GetUserByEmail: async function (email) {
        try {
            return await userModel
                .findOne({
                    isDeleted: false,
                    email: email
                })
        } catch (error) {
            return false;
        }
    },
    GetUserByToken: async function (token) {
        try {
            let user = await userModel
                .findOne({
                    isDeleted: false,
                    forgotPasswordToken: token
                })
            if (user.forgotPasswordTokenExp > Date.now()) {
                return user;
            }
            return false;
        } catch (error) {
            return false;
        }
    },
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        })
        if (user) {
            if (user.lockTime && user.lockTime > Date.now()) {
                return false;
            } else {
                if (bcrypt.compareSync(password, user.password)) {
                    user.loginCount = 0;
                    await user.save();
                    let token = jwt.sign({
                        id: user.id
                    }, 'secret', {
                        expiresIn: '1d'
                    })
                    return token;
                } else {
                    //sai pass
                    user.loginCount++;
                    if (user.loginCount == 3) {
                        user.loginCount = 0;
                        user.lockTime = Date.now() + 3_600_000;
                    }
                    await user.save();
                    return false;
                }
            }
        } else {
            return false;
        }
    },
    ChangePassword: async function (user, oldPassword, newPassword) {
        if (bcrypt.compareSync(oldPassword, user.password)) {
            user.password = newPassword;
            await user.save();
            return true;
        } else {
            return false;
        }
    },
    ImportUserFromXLSX: async function (filePath, roleId) {
        const results = {
            success: [],
            failed: [],
            total: 0
        };

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);

            if (!worksheet) {
                throw new Error('Không thể đọc file Excel');
            }

            // Duyệt qua từng hàng (bắt đầu từ hàng 2, hàng 1 là header)
            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                const row = worksheet.getRow(rowNumber);
                
                // Lấy username từ cột 1 và email từ cột 2
                const username = row.getCell(1).value;
                const email = row.getCell(2).value;

                results.total++;

                // Kiểm tra dữ liệu đầu vào
                if (!username || !email) {
                    results.failed.push({
                        row: rowNumber,
                        username: username,
                        email: email,
                        error: 'Username hoặc email không được để trống'
                    });
                    continue;
                }

                try {
                    // Kiểm tra username, email đã tồn tại
                    let existingUsername = await userModel.findOne({ 
                        username: username, 
                        isDeleted: false 
                    });
                    
                    if (existingUsername) {
                        results.failed.push({
                            row: rowNumber,
                            username: username,
                            email: email,
                            error: 'Username đã tồn tại'
                        });
                        continue;
                    }

                    let existingEmail = await userModel.findOne({ 
                        email: email, 
                        isDeleted: false 
                    });
                    
                    if (existingEmail) {
                        results.failed.push({
                            row: rowNumber,
                            username: username,
                            email: email,
                            error: 'Email đã tồn tại'
                        });
                        continue;
                    }

                    // Tạo password ngẫu nhiên 16 kí tự
                    const plainPassword = generateRandomPassword(16);

                    // Tạo user mới
                    const newUser = new userModel({
                        username: username,
                        password: plainPassword,
                        email: email,
                        role: roleId,
                        fullName: '',
                        status: false,
                        loginCount: 0
                    });

                    await newUser.save();

                    // Gửi email password cho user
                    try {
                        await sendPasswordEmail(email, username, plainPassword);
                    } catch (emailError) {
                        console.error(`Không thể gửi email cho ${email}:`, emailError.message);
                    }

                    results.success.push({
                        row: rowNumber,
                        username: username,
                        email: email,
                        message: 'Tạo user thành công, password đã được gửi qua email'
                    });

                } catch (error) {
                    results.failed.push({
                        row: rowNumber,
                        username: username,
                        email: email,
                        error: error.message
                    });
                }
            }

            // Xóa file sau khi xử lý
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Lỗi khi xóa file:', err.message);
            }

            return results;

        } catch (error) {
            // Xóa file nếu có lỗi
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Lỗi khi xóa file:', err.message);
            }
            throw error;
        }
    }
}
