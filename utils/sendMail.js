const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
        user: "b46fc63747aa45",
        pass: "49367f3736976b",
    },
});

module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: "admin@haha.com",
            to: to,
            subject: "reset password email",
            text: "click vao day de doi pass",
            html: `click vao <a href="${url}">day</a> de doi pass`,
        });
    },
    sendPasswordEmail: async function (to, username, password) {
        await transporter.sendMail({
            from: "admin@haha.com",
            to: to,
            subject: "Thong tin dang nhap tai khoan",
            text: `Tai khoan cua ban da duoc tao.\nUsername: ${username}\nPassword: ${password}\nVui long doi password sau lan dang nhap dau tien.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f6f9fc;">
                    <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                        <h2 style="margin: 0 0 16px; color: #111827;">Thong tin dang nhap tai khoan</h2>
                        <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">
                            Tai khoan cua ban da duoc tao thanh cong trong he thong.
                        </p>
                        <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;">
                            <p style="margin: 0 0 8px; color: #111827;"><strong>Username:</strong> ${username}</p>
                            <p style="margin: 0; color: #111827;"><strong>Password:</strong> ${password}</p>
                        </div>
                        <p style="margin: 0; color: #b45309; line-height: 1.6;">
                            Vui long doi password sau lan dang nhap dau tien de bao mat tai khoan.
                        </p>
                    </div>
                </div>
            `,
        });
    }
};
