const {Worker} = require('bullmq');
const connection = require('../utils/redis-connection');
const sgmail = require('@sendgrid/mail');
sgmail.setApiKey(process.env.SENDGRID_API_KEY);

const worker1 = new Worker('reservation-confirmation', async job => {

    const {eventName, reservationId, username , email} = job.data;

    const emailHTML = ` <h1> ${eventName} Confirmation </h1><br><p> Hello ${username}, Your reservation id is ${reservationId}, you will enter the event using it</p> `

    try {
        await sgmail.send({
                to: email,
                from: process.env.SENDGRID_EMAIL,
                subject: 'Event Confirmation',
                html: emailHTML,
            }
        );
    } catch (err) {
        throw new Error(err.message);
    }

}, {
    connection
}) ;

worker1.on( 'completed' , ( job , err ) => {
    console.log( ` Confirmation email is sent to ${job.data.username}` );
} )

worker1.on( 'error' , (err) => {
   console.log( `Confirmation email is not sent, ${err.message}` );
});

worker1.on( 'failed' , (err,err) => {
    console.log( `Confirmation email is not sent, ${err.message}` );
})