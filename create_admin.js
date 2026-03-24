const mongoose = require('mongoose');
const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');

async function createAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C3');

        let adminRole = await roleModel.findOne({ name: 'admin' });
        if (!adminRole) {
            adminRole = new roleModel({
                name: 'admin',
                description: 'Administrator role'
            });
            await adminRole.save();
            console.log('Role admin tao thanh cong');
        } else {
            console.log('Role admin da ton tai');
        }

        let userRole = await roleModel.findOne({ name: 'user' });
        if (!userRole) {
            userRole = new roleModel({
                name: 'user',
                description: 'User role'
            });
            await userRole.save();
            console.log('Role user tao thanh cong');
        } else {
            console.log('Role user da ton tai');
        }

        const existingAdmin = await userModel.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user da ton tai: admin / admin123');
            process.exit(0);
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
        console.log('Admin user tao thanh cong');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Loi:', error.message);
        process.exit(1);
    }
}

createAdmin();
