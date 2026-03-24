// Tạo random string 16 kí tự bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt
function generateRandomPassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Đảm bảo có ít nhất 1 của mỗi loại
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Thêm các kí tự ngẫu nhiên còn lại
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Xáo trộn password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
}

module.exports = {
    generateRandomPassword
};
