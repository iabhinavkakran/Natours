const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class Email {

    constructor(user, url){
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,
        this.from = `Abhinav Chaudhary <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if ( process.env.NODE_ENV === 'production') {
            // SendGrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth:{
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        }

        return nodemailer.createTransport({
            // using mailtrap credentials here
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            auth:{
                    user: process.env.MAILTRAP_USERNAME,
                    pass: process.env.MAILTRAP_PASSWORD
                }
            // service: 'Gmail',
            // auth:{
            //     user: process.env.EMAIL_USERNAME,
            //     pass: process.env.EMAIL_PASSWORD
            // }
            // firts Activate in gamil "less secure app" options
        });
    }

        // Send actual mail 
        async send(template, subject){
            // 1) Render HTML template using pug
            const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject  
            });

            // 1) define mail Options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: convert(html)
            };

            // 1) send mail using transporter
            await this.newTransport().sendMail(mailOptions);
        };

        async sendWelcome(){
           await this.send('welcome', 'Welcome to Natours Tour')
        };

        async sendPasswordReset(){
            await this.send('passwordReset', 
            'Your password reset token (valid for only 10 minutes)')
         }
        
};

module.exports = Email;