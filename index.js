const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session");
const WHATSAPP_TOKEN =
"EAAJuhpRf7lEBO04Ia04zlH92Wikv3YpEOzg9I6BdZCtfL7y4DF1hyKXNzrZCsQNxrXun6PobruAFRxUweQNaL5ZAbDRWuiKf5agiCnubCzYPilFAZAMSweK2lx14qAsV90QxwN3skUQlWYMGZCYLzuaXHL6fpZB3dKmSKVPedZCFoTXw2lBGPZBbwe2mYqFeVVX0ZCe9touMZBK2o1wWKTOZAZBxJhw2SKAO64mlDq4ZD";
const TOKEN = "abhijith123";
const userState = new Map();
const app = express();

app.use(express.json());
const dbPath = "dashboard/json/database.json";

app.get('/api/bookings', (req, res) => {
    const status = req.query.status;
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const bookings = status ? data.bookings.filter(b => b.status === status) : data.bookings;
    res.json(bookings);
});

app.put('/api/bookings/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status, reply, stage } = req.body;

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const index = data.bookings.findIndex(b => b.id === id);

    if (index === -1) return res.status(404).send('Booking not found');

    data.bookings[index].status = status;
    data.bookings[index].reply = reply;
    data.bookings[index].stage = stage;

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    res.send('Updated');
});


const databasePath = path.join(__dirname, 'dashboard/json/database.json');

const writeUserStateMap = (userMap) => {
  try {
    // Convert Map to plain object
    const plainObject = Object.fromEntries(userMap);

    // Write to file
    fs.writeFileSync(databasePath, JSON.stringify(plainObject, null, 2));
    console.log('User state saved.');
  } catch (err) {
    console.error('Failed to write user state:', err);
  }
};

// server starting point

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: "UrbanziSecureKey#2025",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 3600000 },
    }),
);
app.use(express.static(__dirname));

const userCreds = JSON.parse(
    fs.readFileSync(path.join(__dirname, "user-cred.json")),
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard/dashboard.html"));
});


app.get ('/webhook', (req, res) =>{
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === TOKEN){
    res.status(200).send(challenge);
  }
  else{
    res.sendStatus(403);
  }
})


app.post('/webhook', async (req, res) =>{
     // console.log(JSON.stringify(req.body, null, 2))

    const { entry } = req.body;

    if (!entry || !entry.length === 0 ){
        return res.status(400).send('invalid request');
      }

    const  changes = entry[0].changes

      if (!changes || !changes.length === 0 ){
        return res.status(400).send('invalid request');
      }

      const statuses = changes[0].value.statuses ? changes[0].value.statuses[0] : null
      const messages = changes[0].value.messages ? changes[0].value.messages[0] : null

    if (statuses){
        // handle msg status
        console.log(`message sent status update 
        status: ${statuses.status}
        `);
      }


    


    if (messages && messages.type === 'text') {
        const userPhone = messages.from;
        const userMsg = messages.text.body.trim();
        const timeStamp = messages.timestamp
        console.log(`New message from ${userPhone}: ${userMsg}`);
        console.log(`timestamp: ${timeStamp}`)

       const state = userState.get(userPhone);  

        if (!state){
          sendMsg(userPhone, welcomeMsg)
          userState.set(userPhone, {state: 'welcomeMsg Sent'})
          setTimeout(() => {
            sendBtn(userPhone, LanguageBtn);
          }, 500);
          return res.status(200).send('ok');
        }

      if (state.state === 'booking name'){
        const name = userMsg
        await sendMsg(userPhone, `2️⃣ Preferred Appointment Date:`)
        setTimeout(() => {
          sendBtn(userPhone, DateBtn)
        })
        userState.set(userPhone, {state: 'booking date', name: name})
        console.log(userState)
        return res.status(200).send('ok');
      }

      
    }

   if (messages && messages.type === 'interactive'){
     if(messages.interactive.type === 'button_reply'){
         const userPhone = messages.from;
         const userMsg = messages.interactive.button_reply.title.trim();
         const userId = messages.interactive.button_reply.id.trim()
         console.log(`New message from ${userPhone}: ${userMsg} ${userId}`);


         if (userId === 'English'){
            userState.set(userPhone, {state: 'combined list sent'})
           console.log(userState)
            sendBtn(userPhone, CombinedList)
            return res.status(200).send('ok');
           
         }

         if (userId === 'Malayalam'){
            sendMsg(userPhone, 'മലയാളം ഇപ്പോൾ ലഭ്യമല്ല')
            userState.set(userPhone, {state: 'Malayalam selected'})
            return res.status(200).send('ok');
         }


        if (userId.startsWith('date_')){
            console.log(userState)
            await sendBtn(userPhone, TimeSlotList)
            const selectedDate = userId.replace('date_', '');
            userState.set(userPhone, {state: 'booking time', name: userState.get(userPhone).name, date: selectedDate})
            console.log(userState)
            return res.status(200).send('ok');  
        }
       
      }



     if(messages.interactive.type === 'list_reply'){
       const userPhone = messages.from;
       const userMsg = messages.interactive.list_reply.title.trim();
       const userId = messages.interactive.list_reply.id.trim()
       console.log(`New message from ${userPhone}: ${userMsg}`);

       // handle know more list
       if (userId === 'about_us'){
         sendMsg(userPhone, aboutUsMsg)
         return res.status(200).send('ok');
       }

       if (userId === 'timings'){
         sendMsg(userPhone, bookingTimeMsg)
         return res.status(200).send('ok');
       }

       if (userId === 'location'){
         sendMsg(userPhone, locationMsg)
         return res.status(200).send('ok');
       }
       if (userId === 'Fees'){
         sendMsg(userPhone, feesPaymentMsg)
         return res.status(200).send('ok');
       }


       //handle booking 

       if (userId === 'book_appointment'){
         await sendMsg(userPhone, `📅 Let's book your appointment!
Please provide the following details:

1️⃣ Your Full Name: `)
         userState.set(userPhone, {state: 'booking name'})
         console.log(userState)
         return res.status(200).send('ok');
       }


       // handle time slot
       if (userId.startsWith('slot_')){
         const selectedTime = userId.replace('slot_', '');
         timeStamp = messages.timestamp
         const timeLog = timeConvert(timeStamp)
         const status = 'Pending'
         const name = userState.get(userPhone).name
         const date = userState.get(userPhone).date
         const newSelectTime = selectedTime.replace('_', ' - ').replace('_', ' ').replace('_', ':')
         userState.set (userPhone, {state: 'booking completed', name: name, date: date, time: newSelectTime , TimeLog: timeLog , status: status})
         console.log(userState)
         await sendMsg(userPhone, `We are checking for availability... once the slot is confirmed, we will send you a confirmation message with all the details.
         
Please be patient....`)
         
         writeUserStateMap(userState)
         return res.status(200).send('ok');

         
         
       }
     }

    }
    

   
  res.status(200).send('ok');
  
    
     
})



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if email matches
    if (email === userCreds.email) {
        // Compare hashed password using bcrypt
        const passwordMatch = await bcrypt.compare(
            password,
            userCreds.password,
        );

        if (passwordMatch) {
            req.session.user = email;
            return res.redirect("/dashboard");
        }
    }

    res.send('<p>Invalid email or password. <a href="/">Try again</a></p>');
});

app.get("/dashboard", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "dashboard.html"));
    } else {
        res.redirect("/");
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});



// send msg funtion

async function sendMsg(phone, msg){
 await axios({
   url: 'https://graph.facebook.com/v22.0/486028944594743/messages',
     method: 'post',
     headers: {
       'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
       'Content-Type': 'application/json',
     },
     data: {
       messaging_product: 'whatsapp',
       to: phone,
       type: 'text',
       text: {
         body: msg,
       },
     }
 })
}


async function sendBtn(phone, bodyContent) {
  const msg = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: bodyContent
  };

  try {
    await axios({
      url: 'https://graph.facebook.com/v17.0/486028944594743/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: msg
    });
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}



// msg template
const welcomeMsg = `👋 Welcome to Dr. Test's WhatsApp Appointment Bot!

I’ll help you book your visit easily — no more waiting in long queues! 🏥✨
Everything is automated for your convenience.

If you need any help, feel free to reach out:

📞 Phone: [Your Number]
📧 Email: [Your Email]
💬 WhatsApp: [Your WhatsApp Number]`;


const LanguageBtn = {
  type: 'button',
  body: {
    text: `Let’s get started 👇
Please select a language to continue.`
  },
  action: {
    buttons: [
      {
        type: 'reply',
        reply: {
          id: 'English',
          title: '1️⃣English'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'Malayalam',
          title: '2️⃣മലയാളം'
        }
      }
    ]
  }
};


const CombinedList = {
  type: 'list',
  body: {
    text: '🤖 How can I assist you today? Please choose an option below:',
  },
  footer: {
    text: 'We’re here to assist you!, 👇 Please choose an option:',
  },
  action: {
    button: 'Select Option',
    sections: [
      {
        title: '📅 Appointment Booking',
        rows: [
          {
            id: 'book_appointment',
            title: 'Book Appointment',
            description: 'Schedule a new appointment',
          },
        ]
      },
      {
        title: '📋 Appointment Management',
        rows: [
          {
            id: 'show_appointments',
            title: 'Show All Appointments',
            description: 'View your upcoming bookings',
          },
          {
            id: 'cancel_appointment',
            title: 'Cancel Appointment',
            description: 'Cancel an existing booking',
          },
          {
            id: 'reschedule_appointment',
            title: 'Reschedule Appointment',
            description: 'Change your booking schedule',
          },
        ],
      },
      {
        title: 'ℹ️ Know More',
        rows: [
          {
            id: 'about_us',
            title: '🧑‍⚕️ About Doctor',
            description: 'Who we are and what we do',
          },
          {
            id: 'timings',
            title: '🕒 Appointment Timings',
            description: 'When you can book appointments',
          },
          {
            id: 'Fees',
            title:'💰 Fees & Payment Info',
            description: 'Our pricing and payment options'
          },
          {
            id: 'location',
            title: '📍 Location and contact',
            description: 'Our physical address and contact details',
          },
        ],
      },
    ],
  },
};


const aboutUsMsg = 'Dr. [Your Name] is a dedicated and compassionate medical professional committed to providing personalized and high-quality care to every patient. With years of experience and a patient-first approach, Dr. [Your Name] specializes in [Your Specialty, e.g., General Medicine, Pediatrics, etc.], ensuring timely diagnosis, effective treatment, and ongoing support. Our clinic blends advanced medical knowledge with a warm, welcoming environment where your health and comfort come first.'

const bookingTimeMsg = `🗓️ Monday to Saturday
⏰ 9:00 AM – 1:00 PM
⏰ 4:00 PM – 7:00 PM

📴 Closed on Sundays and public holidays.`


const feesPaymentMsg = `💳 Fees & Payment
Consultation Fee: ₹500 per appointment

💰 Payment Methods Accepted:
✅ Cash
✅ UPI / Google Pay / PhonePe
✅ Debit & Credit Cards`


const locationMsg = `📍 Location & Contact Details

🏥 Clinic Address:
Dr. [Your Name] Clinic
[Street Address]
[Area/Locality], [City], [PIN Code]
📌 [Google Maps Link – optional]

📞 Phone: [Your Phone Number]
💬 WhatsApp: [Same or Different Number]
📧 Email: [your@email.com]`



// Set timezone to India (Asia/Kolkata)
const today = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
const tomorrow = new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000); // add 1 day

const todayDate = new Date(today);

// Format display: "29 Apr", ID: "date_29/04/2025"
const formatDisplayDate = (date) =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const formatIdDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `date_${day}/${month}/${year}`;
};

const todayStr = formatDisplayDate(todayDate);
const tomorrowStr = formatDisplayDate(tomorrow);
const todayId = formatIdDate(todayDate);
const tomorrowId = formatIdDate(tomorrow);

// Final Date Button Message
const DateBtn = {
  type: 'button',
  body: {
    text: `📅 Please select a date for your appointment:`,
  },
  action: {
    buttons: [
      {
        type: 'reply',
        reply: {
          id: todayId,
          title: `1️⃣ ${todayStr}`,
        }
      },
      {
        type: 'reply',
        reply: {
          id: tomorrowId,
          title: `2️⃣ ${tomorrowStr}`,
        }
      }
    ]
  }
};



// time slot

const TimeSlotList = {
  type: 'list',
  body: {
    text: '⏰ Please select a preferred appointment time:',
  },
  footer: {
    text: 'Available slots are shown below.',
  },
  action: {
    button: 'Select Time Slot',
    sections: [
      {
        title: '🕘Morn Slots(9AM-1PM)',
        rows: [
          {
            id: 'slot_9_10_am',
            title: '9:00 AM - 10:00 AM',
            description: 'Morning slot',
          },
          {
            id: 'slot_10_11_am',
            title: '10:00 AM - 11:00 AM',
            description: 'Morning slot',
          },
          {
            id: 'slot_11_12_pm',
            title: '11:00 AM - 12:00 PM',
            description: 'Morning slot',
          },
          {
            id: 'slot_12_1_pm',
            title: '12:00 PM - 1:00 PM',
            description: 'Morning slot',
          },
        ]
      },
      {
        title: '🌆Eveng Slots(4PM-7PM)',
        rows: [
          {
            id: 'slot_4_5_pm',
            title: '4:00 PM - 5:00 PM',
            description: 'Evening slot',
          },
          {
            id: 'slot_5_6_pm',
            title: '5:00 PM - 6:00 PM',
            description: 'Evening slot',
          },
          {
            id: 'slot_6_7_pm',
            title: '6:00 PM - 7:00 PM',
            description: 'Evening slot',
          },
        ]
      }
    ]
  }
};

// time stamp covert

function timeConvert(timestamp) {
  // Convert the Unix timestamp to milliseconds
  const date = new Date(timestamp * 1000);

  // Format the date to IST using Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return formatter.format(date);
}


