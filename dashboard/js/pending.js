const fs = require('fs');
const path = '../json/database.json';

function updateBooking(bookingId, newStatus, replyMessage) {

    console.log(`Updating booking ${bookingId}: Status=${newStatus}, Reply=${replyMessage}`);

}

updateBooking();