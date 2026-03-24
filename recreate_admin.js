const mongoose = require('mongoose');
const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');

async function recreateAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C3');

        await userModel.deleteOne({ username: 'admin' });
        console.log('Admin cu da xoa');

        const adminRole = await roleModel.findOne({ name: 'admin' });
        if (!adminRole) {
            console.log('Role admin khong tim thay');
            process.exit(1);
        }

        const admin = new userModel({
            username: 'admin',
            password: 'admin123',
            email: 'admin@example.com',
            fullName: 'Administrator',
            role: adminRole._id,
            status: true,
            loginCount: 0
        });

        await admin.save();
        console.log('Admin user tao lai thanh cong');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Loi:', error.message);
        process.exit(1);
    }
}

recreateAdmin();
