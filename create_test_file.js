const ExcelJS = require('exceljs');
const path = require('path');

async function createTestFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Thêm header
    worksheet.addRow(['username', 'email']);

    // Thêm 3 dòng test data
    worksheet.addRow(['testuser1', 'testuser1@mailtrap.io']);
    worksheet.addRow(['testuser2', 'testuser2@mailtrap.io']);
    worksheet.addRow(['testuser3', 'testuser3@mailtrap.io']);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adjust column width
    worksheet.columns = [
        { width: 15 },
        { width: 30 }
    ];

    // Save file
    await workbook.xlsx.writeFile('test_import.xlsx');
    console.log('✓ File test_import.xlsx đã được tạo thành công!');
}

createTestFile().catch(err => console.error(err));
