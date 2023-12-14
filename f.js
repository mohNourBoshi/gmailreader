const fs = require('fs');
const process = require('process');
const {google} = require('googleapis');


const CLIENT_ID = '448854918529-m1rj04i3dq6lbdiphnfoh3apu1ubf30v.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const TOKEN_PATH = 'token.json'; // You can store the token in a file

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Check if we have previously stored a token.
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    getAccessToken(oAuth2Client);
  } else {
    oAuth2Client.setCredentials(JSON.parse(token));
    listLabels(oAuth2Client);
  }
});

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      listLabels(oAuth2Client);
    });
  });
}

function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list(
      {
        userId: 'me',
      },
      (err, res) => {
        if (err) return console.error('The API returned an error:', err.message);
  
        const messages = res.data.messages;
        if (messages.length) {
          console.log('Messages:');
          messages.forEach((message) => {
            gmail.users.messages.get(
              {
                userId: 'me',
                id: message.id,
                format: 'full', // Request the full format to get the 'raw' content
              },
              (err, messageDetails) => {
                if (err) return console.error('Error fetching message details:', err.message);
  
                const subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject').value;
                const sender = messageDetails.data.payload.headers.find(header => header.name === 'From').value;
  
                console.log(`Subject: ${subject}`);
                console.log(`Sender: ${sender}`);

                console.log(`Message ID: ${message.id}`);
                console.log('-----------------------------');
              }
            );
          });
        } else {
          console.log('No messages found.');
        }
      }
    );
  }
  
