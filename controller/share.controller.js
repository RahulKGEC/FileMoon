const ShareModel = require("../model/share.model")
const nodemailer = require("nodemailer")

const conn = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
})

const getEmailTemplate = (link)=>{
    return `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Your File is Ready - Filemoon</title>
            </head>
            <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                <td align="center" style="padding-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 28px; color: #1e88e5;">Filemoon</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;">India's best file sharing platform</p>
                </td>
                </tr>
                <tr>
                <td align="center" style="padding: 30px 0 10px 0;">
                    <h2 style="margin: 0; font-size: 22px; color: #333;">Your File is Ready to Download</h2>
                </td>
                </tr>
                <tr>
                <td style="color: #555555; font-size: 16px; line-height: 1.6; padding: 10px 0;">
                    <p>Hello,</p>
                    <p>Your requested file is ready. Click the button below to download it.</p>
                    <p><strong>Note:</strong> This link will expire on <span style="color:#d9534f;">{{expirationDate}}</span>.</p>
                </td>
                </tr>
                <tr>
                <td align="center" style="padding: 20px 0;">
                    <a href="${link}" download="demo.png" style="background-color: #1e88e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">Download File</a>
                </td>
                </tr>
                <tr>
                <td style="color: #888888; font-size: 14px; text-align: center; padding-top: 20px;">
                    <p>If you did not request this file, you can safely ignore this message.</p>
                </td>
                </tr>
                <tr>
                <td style="text-align: center; color: #aaaaaa; font-size: 12px; padding-top: 20px;">
                    &copy; {{year}} Filemoon. All rights reserved.
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
    </body>
    </html>
    `
}

const shareFile = async (req, res)=>{
    try {
        const {email, fileId} = req.body
        const link = `${process.env.DOMAIN}/api/file/download/${fileId}`
        const options = {
            from : process.env.SMTP_EMAIL,
            to: email,
            subject: 'Filemoon - New File Received',
            html: getEmailTemplate(link)
        }

        const payload = {
            user: req.user.id,
            receiverEmail: email,
            file: fileId
        }
        
        await Promise.all([
            conn.sendMail(options),
            ShareModel.create(payload)
        ])
        res.status(200).json({message: 'Email sent'})
    }
    catch(err)
    {
        res.status(500).json({message: err.message})
    }
}

const fetchShared = async (req, res)=>{
    try {
        const {limit} = req.query
        const history = await ShareModel.find({user: req.user.id})
        // .populate('user', 'fullname email mobile -_id')
        .populate('file')
        .sort({createdAt: -1})
        .limit(limit)
        res.status(200).json(history)
    }
    catch(err)
    {
        res.status(500).json({message: err.message})
    }
}

module.exports = {
    shareFile,
    fetchShared
}