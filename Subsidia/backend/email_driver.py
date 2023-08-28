import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

def send_email(to_email: str, subject: str, message: str):
    try:
        # Log in to your Gmail account
        username = os.getenv("gmail_email")
        password = os.getenv("gmail_password")

        print(password)
        
        # Set up the MIME
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'html'))

        # Connect to Gmail's SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        
        # Log into Gmail account
        server.login(username, password)

        # Send the email
        server.sendmail(username, to_email, msg.as_string())
        # Quit the server
        server.quit()

        return True
    except Exception as e:
        print(str(e))
        return False
