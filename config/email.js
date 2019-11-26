const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const handlebars = require('express-handlebars');
const path = require('path');


var options = {
    viewEngine: handlebars.create({
        partialsDir: 'partials/',
        defaultLayout: false
    }),
    viewPath: path.resolve(__dirname, '../views')
}

const transporter = nodemailer.createTransport({
    service: "hotmail", // hostname
    auth: {
        user: "orders@triangulo.com.br",
        pass: "*%TppOrd*"
    },
});

transporter.use('compile', hbs(options));
module.exports = {

    async neworder(refnumber, customer) {
        let mailOptions = {
            from: 'orders@triangulo.com.br',
            to: 'orders@triangulo.com.br',
            subject: `New Order S.O ${refnumber}!`,
            template: 'template',
            context: {
                title: 'New order registred!',
                user: `${customer} registrou uma nova sales order.`,
                image: `./CapturaPreta.png`,
                body1: `com o numero S.O ${refnumber}<br>`,
                body2: `Clique no link para ir na pagina das ordens (LINK NÃO ESTA FUNCIONANDO)`,
                link: `Link para ir na pagina de administrador ver detalhe da ordem no aplicativo`
            }
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email enviado: ' + info.response);
            }
        });
    }
}
