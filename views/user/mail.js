
const http = require("http");
const nodemailer = require("nodemailer");

const server = http.createServer((request, response) => {
    const auth = nodemailer.createTransport({
        service: "gmail",
        secure : true,
        port : 465,
        auth: {
            user: "sujoyghoshal.s@gmail.com",
            pass: "cxsp uzwl foeb ftuz"
            
            //*cxsp uzwl foeb ftuz
        }
    });

    const receiver = {
        from : "sujoyghoshal.s@gmail.com",
        to : "sujoy1196.be21@chitkarauniversity.edu.in",
        subject : "Node Js Mail Testing!",
        text : "Hello this is a text mail!"
    };

    auth.sendMail(receiver, (error, emailResponse) => {
        if(error)
        throw error;
        console.log("success!");
        response.end();
    });
    
});

server.listen(8080);