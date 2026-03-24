const mongoose = require('mongoose');
const userModel = require('./schemas/users');

async function checkAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C3');
        
        const admin = await userModel.findOne({ username: 'admin' });
        if (admin) {
            console.log('✓ Admin user tồn tại');
            console.log('  Username:', admin.username);
            console.log('  Email:', admin.email);
            console.log('  Role ID:', admin.role);
        } else {
            console.log('❌ Admin user KHÔNG tồn tại');
        }
        
        const allUsers = await userModel.find();
        console.log('\nTổng số users:', allUsers.length);
        allUsers.forEach((user, idx) => {
            console.log(`${idx + 1}. ${user.username} (${user.email})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error.message);
        process.exit(1);
    }
}

checkAdmin();
