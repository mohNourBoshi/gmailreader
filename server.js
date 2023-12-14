// const express = require('express');
// const { google } = require('googleapis');
// const fs = require('fs').promises;
// const readline = require('readline');
// const path = require('path');

// const app = express();
// const port = 3000;

// app.use(express.json());

// const CLIENT_ID = '448854918529-m1rj04i3dq6lbdiphnfoh3apu1ubf30v.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
// const TOKEN_PATH = 'token.json';

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// app.get('/run-f', async (req, res) => {
//   try {
//     // Check if we have previously stored a token.
//     const token = await fs.readFile(TOKEN_PATH);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     const messageIds = await listLabels(oAuth2Client);    


//     // Send the message IDs as JSON
//     res.json({ messageIds });
//   } catch (error) {
//     console.error('Error running f.js:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

// function listLabels(auth) {
//   return new Promise((resolve, reject) => {
//     const gmail = google.gmail({ version: 'v1', auth });
//     gmail.users.messages.list(
//       {
//         userId: 'me',
//       },
//       (err, res) => {
//         if (err) {
//           reject(`The API returned an error: ${err.message}`);
//           return;
//         }

//         const messages = res.data.messages;
//         if (messages.length) {
//           const messageIds = messages.map((message) => message.id);
//           resolve(messageIds);
//         } else {
//           resolve([]); // No messages found
//         }
//       }
//     );
//   });
// }

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });


//////////////////////////////////////
// const express = require('express');
// const { google } = require('googleapis');
// const fs = require('fs').promises;
// const readline = require('readline');
// const path = require('path');

// const app = express();
// const port = 3000;

// app.use(express.json());

// const CLIENT_ID = '448854918529-m1rj04i3dq6lbdiphnfoh3apu1ubf30v.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
// const TOKEN_PATH = 'token.json';

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// app.get('/run-f', async (req, res) => {
//   try {
//     // Check if we have previously stored a token.
//     const token = await fs.readFile(TOKEN_PATH);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     const messagesDetails = await listLabels(oAuth2Client);

//     // Send the message details as JSON
//     res.json({ messagesDetails });
//   } catch (error) {
//     console.error('Error running f.js:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

// async function listLabels(auth) {
//   const gmail = google.gmail({ version: 'v1', auth });
//   const messages = await new Promise((resolve, reject) => {
//     gmail.users.messages.list(
//       {
//         userId: 'me',
//       },
//       (err, res) => {
//         if (err) {
//           reject(`The API returned an error: ${err.message}`);
//           return;
//         }

//         const messages = res.data.messages;
//         if (messages.length) {
//           resolve(messages);
//         } else {
//           resolve([]); // No messages found
//         }
//       }
//     );
//   });

//   const messagesDetails = await Promise.all(
//     messages.map((message) => getMessageDetails(gmail, message.id))
//   );

//   return messagesDetails;
// }

// async function getMessageDetails(gmail, messageId) {
//   return new Promise((resolve, reject) => {
//     gmail.users.messages.get(
//       {
//         userId: 'me',
//         id: messageId,
//         format: 'full',
//       },
//       (err, messageDetails) => {
//         if (err) {
//           reject(`Error fetching message details for ID ${messageId}: ${err.message}`);
//           return;
//         }

//         const subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject').value;
//         const sender = messageDetails.data.payload.headers.find(header => header.name === 'From').value;
//         const body = getMessageBody(messageDetails.data);

//         resolve({
//           messageId,
//           subject,
//           sender,
//           body,
//         });
//       }
//     );
//   });
// }

// function getMessageBody(message) {
//   const parts = message.payload.parts;
//   if (parts && parts.length > 0) {
//     const bodyPart = parts.find(part => part.mimeType === 'text/plain');
//     if (bodyPart) {
//       const decodedBody = Buffer.from(bodyPart.body.data, 'base64').toString('utf-8');
//       return decodedBody;
//     }
//   }

//   return 'No plain text body available.';
// }

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
/////////////////////////


const express = require('express');
const { google } = require('googleapis');
const fs = require('fs').promises;
const readline = require('readline');
const path = require('path');
const { htmlToText } = require('html-to-text');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());  

const CLIENT_ID = '448854918529-m1rj04i3dq6lbdiphnfoh3apu1ubf30v.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const TOKEN_PATH = 'token.json';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

app.get('/run-f', async (req, res) => {
  try {
    // Check if we have previously stored a token.
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    const messages = await listLabels(oAuth2Client);

    // Send the messages as JSON
    res.json({ messages });
  } catch (error) {
    console.error('Error running f.js:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

function listLabels(auth) {
  return new Promise((resolve, reject) => {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list(
      {
        userId: 'me',
        q:"from :info@visitjordan.gov.jo"
      },
      async (err, res) => {
        if (err) {
          reject(`The API returned an error: ${err.message}`);
          return;
        }

        const messages = res.data.messages;
        if (messages.length) {
          const messageDetailsPromises = messages.map((message) => fetchAndProcessMessageDetails(gmail, message.id));
          const messageDetails = await Promise.all(messageDetailsPromises);
          resolve(messageDetails);
        } else {
          resolve([]); // No messages found
        }
      }
    );
  });
}
async function fetchAndProcessMessageDetails(gmail, messageId) {
  return new Promise((resolve, reject) => {
    gmail.users.messages.get(
      {
        userId: 'me',
        id: messageId,
        format: 'full',
        
        
      },
      (err, messageDetails) => {
        if (err) {
          reject(`Error fetching message details: ${err.message}`);
          return;
        }

        const subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject').value;
        const sender = messageDetails.data.payload.headers.find(header => header.name === 'From').value;
        const date = messageDetails.data.payload.headers.find(header => header.name === 'Date').value;

        // Extract text content from different parts of the payload
        let bodyText = '';
        if (messageDetails.data.payload.body.data) {
          // If the body is directly in payload.body.data
          bodyText = htmlToText(Buffer.from(messageDetails.data.payload.body.data, 'base64').toString('utf-8'), {
            wordwrap: 130,
          });
        } else if (messageDetails.data.payload.parts && messageDetails.data.payload.parts[0].body.data) {
          // If the body is in payload.parts[0].body.data
          bodyText = htmlToText(Buffer.from(messageDetails.data.payload.parts[0].body.data, 'base64').toString('utf-8'), {
            wordwrap: 130,
          });
        } else if (messageDetails.data.payload.parts && messageDetails.data.payload.parts[0].parts[0].body.data) {
          // If the body is in payload.parts[0].parts[0].body.data
          bodyText = htmlToText(Buffer.from(messageDetails.data.payload.parts[0].parts[0].body.data, 'base64').toString('utf-8'), {
            wordwrap: 130,
          });
        }

        resolve({
          subject,
          sender,
          body: bodyText,
          messageId,
          date,
        });
      }
    );
  });
}


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
