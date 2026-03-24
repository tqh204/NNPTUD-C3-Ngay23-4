const mongoose = require('mongoose');
const roleModel = require('./schemas/roles');

async function listRoles() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C3');
        
        const roles = await roleModel.find();
        console.log('Các role tồn tại trong database:');
        roles.forEach((role, index) => {
            console.log(`${index + 1}. ${role.name} (ID: ${role._id})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error.message);
        process.exit(1);
    }
}

listRoles();
