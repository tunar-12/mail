document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').addEventListener('submit', send_mail);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').innerHTML = '';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML += `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
    
        emails.forEach(element => {
          const new_mail = document.createElement('div');
          if(element.read)
          {
            new_mail.innerHTML = `<div class="border row bg-dark" style="cursor: pointer;">
          <h4 class="col-4 text-light">${element.sender}</h4>
          <p class="col-6 text-light">${element.subject}</p>
          <p class="col-2 text-light">${element.timestamp}</p>
          </div>`;
          }else
          {
            new_mail.innerHTML = `<div class="border row" style="cursor: pointer;">
          <h4 class="col-4">${element.sender}</h4>
          <p class="col-6">${element.subject}</p>
          <p class="col-2">${element.timestamp}</p>
          </div>`;
          }
          
          new_mail.addEventListener('click', function() {
            if(mailbox === 'sent')
            {
              view_mail(element.id, true);
            }else
            {
              view_mail(element.id, false);
            }
            
          });
          document.querySelector('#emails-view').append(new_mail);
        });
    });
}

function view_mail(id, isSent)
{
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';
  document.querySelector('#mail-view').innerHTML = '';

  // putting read to true


  // showing mail
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#mail-view').innerHTML = '';
    //check read true
    if(!email.read)
    {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });
    }
    // Print email
    console.log(email);
    
    // adding details
    const mail = document.createElement('div');
          
    mail.innerHTML = `
    <div><strong>From:</strong><p>${email.sender}</p></div>
     <div><strong>To:</strong><p>${email.recipients}</p></div>
     <div><strong>Subject:</strong><p>${email.subject}</p></div>
     <div><strong>Timestamp:</strong><p>${email.timestamp}</p></div>
     <hr>
     <div>${email.body}</div>
     <hr>`;

     
     document.querySelector('#mail-view').append(mail);
     // archived logic(
     if(!isSent)
     {
      const archivedBtn = document.createElement('button');
      if(email.archived)
      {
        archivedBtn.innerHTML = 'Remove From Archived';
      }else
      {
        archivedBtn.innerHTML = 'Archive';
      }

      archivedBtn.addEventListener('click', function() {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => {
          load_mailbox('inbox')
        })
      });
      document.querySelector('#mail-view').append(archivedBtn);
     }
     
    // adding reply button logic
    const reply_div = document.createElement('div');
    reply_div.style = 'padding-top: 10px; padding-bottom: 10px;'
    const reply = document.createElement('button');
    reply.classList.add('btn');
    reply.classList.add('btn-primary');
    reply.innerHTML = 'Reply';
    reply_div.appendChild(reply);

    reply.addEventListener('click', function (){
      compose_email();
      let subject = email.subject;
      if(email.subject.slice(0,3) !== 'Re:')
      {
        subject = "Re:" + email.subject;
      }

      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    });

    document.querySelector('#mail-view').append(reply_div);
    

    
    
});
  
}

function send_mail(event)
{
  event.preventDefault();
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      load_mailbox('sent');
  });
}

