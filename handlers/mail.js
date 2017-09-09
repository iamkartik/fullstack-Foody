const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    port:process.env.MAIL_PORT,
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS,
    }
});

const generateEmail = (filename , options={})=>{
    // __dirname contains current folder location
    // options are the blanks to be filled in like resetURL 
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`,options);  
    // inlining the css as some email clients will not render it  
    // juice takes external css and inlines it
    const inline = juice(html);
    return inline;
};

exports.send = async (options)=>{
    const html = generateEmail(options.filename,options);
    const text = htmlToText.fromString(html);
    const mailOptions ={
        from:'Kartik Sharma <noreply@foody.com>',
        to:options.user.email,
        subject:options.subject,
        html,
        text
    }

    const sendMail = promisify(transport.sendMail,transport);
    return sendMail(mailOptions);
};

