using Microsoft.Extensions.Options;
using Project.Models.AppSettings;
using Project.Models.Domain.Admin;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Project.Services
{
    public class SendGridService : ISendGridService
    {
        private AppKeys _appKeys;
        private string _directory;

        public SendGridService(IOptions<AppKeys> appKeys)
        {
            _appKeys = appKeys.Value;
            _directory = Directory.GetCurrentDirectory();
        }

        public async Task RegisterEmail(string token, string email)
        {
            SendGridMessage msg = GetRegisterTemplate(token, email);
            await Send(msg);
        }

        public async Task PwdResetEmail(string token, string email)
        {
            SendGridMessage msg = GetPwdResetTemplate(token, email);
            await Send(msg);
        }

        public async Task ReplyAppointmentEmail(bool isApproved, PendingEvent singleEvent)
        {
            SendGridMessage msg = GetReplyAppointmentTemplate(isApproved, singleEvent);
            await Send(msg);
        }

        private SendGridMessage GetRegisterTemplate(string token, string email)
        {
            string path = _directory + "\\EmailTemplates\\Registration.html";
            string fileHtml = File.ReadAllText(path)
                .Replace("{{Sender_Name}}", "example")
                .Replace("{{confirmEmailUrl}}", "https://..." + token)
                .Replace("{{Sender_Address}}", "123 Address Ave")
                .Replace("{{Sender_City}}", "Los Angeles")
                .Replace("{{Sender_State}}", "CA")
                .Replace("{{Sender_Zip}}", "90210")
                .Replace("{{bwblogo}}", "https://...");

            EmailAddress from = new EmailAddress("service@example.com", "Example User");
            string subject = "Confirm Your Email";
            EmailAddress to = new EmailAddress(email, "Example User");
            string plainTextContent = "Click the link below to confirm your email:";
            string htmlContent = fileHtml;

            SendGridMessage msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            return msg;
        }

        private SendGridMessage GetPwdResetTemplate(string token, string email)
        {
            string path = _directory + "\\EmailTemplates\\ResetPass.html";
            string fileHtml = File.ReadAllText(path)
                .Replace("{{Sender_Name}}", "BodyWork")
                .Replace("{{confirmEmailUrl}}", "https://localhost:3000/resetpwd?token=" + token)
                .Replace("{{Sender_Address}}", "123 Address Ave")
                .Replace("{{Sender_City}}", "Los Angeles")
                .Replace("{{Sender_State}}", "CA")
                .Replace("{{Sender_Zip}}", "90210")
                .Replace("{{bwblogo}}", "https://photos.angel.co/startups/i/671144-4afc5ed6e97f6fcd3e09ce43d1da2c73-medium_jpg.jpg?buster=1430952813");

            EmailAddress from = new EmailAddress("service@bodyworkbooker.com", "Example User");
            string subject = "Reset Your Password - Bodywork";
            EmailAddress to = new EmailAddress(email, "Example User");
            string plainTextContent = "Click the link below to confirm your email:";
            string htmlContent = fileHtml;
               
            SendGridMessage msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            return msg;
        }

        private SendGridMessage GetReplyAppointmentTemplate(bool isApproved, PendingEvent singleEvent)
        {
            string LineTwo = "";

            if (!string.IsNullOrEmpty(singleEvent.Location.LineTwo)) LineTwo = "< tr >< td ></ td >< td >" + singleEvent.Location.LineTwo + "</ td ></ tr >";

            string msg1 = "<table style='border:2px solid grey; width:100%; max-width: 550px; margin: 5px; text-align:left; padding: 20px'>"
                + "<tr><td><b>Service</b></td><td>" + singleEvent.ServiceType + "</td></tr>"
                + "<tr><td><b>Date</b></td><td>"+ singleEvent.StartTime.ToShortDateString() +"</td></tr>"
                + "<tr><td><b>Start</b></td><td>"+ singleEvent.StartTime.ToShortTimeString() + "</td></tr>"
                + "<tr><td><b>End</b></td><td>"+ singleEvent.EndTime.ToShortTimeString() + "</td></tr>"
                + "<tr><td><b>Address</b></td><td>" + singleEvent.Location.LineOne + "</td></tr>"
                + LineTwo
                + "<tr><td></td><td>"+ singleEvent.Location.City +", "+ singleEvent.Location.State.Code +", " + singleEvent.Location.Zip + "</td></tr>"
                + "<tr><td colspan='2'>This was created "+ (DateTime.Now - singleEvent.DateCreated).Days + " day(s) ago.</td></tr></table>";

            string msg2 = (isApproved)
                ? "Your appointment is now set!"
                : "Unfortunately, we need to reschedule.";

            string path = _directory + "\\EmailTemplates\\ReplyAppointment.html";
            string fileHtml = File.ReadAllText(path)
                .Replace("{{Sender_Name}}", "BodyWork")
                .Replace("{{loginUrl}}", "https://localhost:3000/login")
                .Replace("{{Sender_Address}}", "123 Address Ave")
                .Replace("{{Sender_City}}", "Los Angeles")
                .Replace("{{Sender_State}}", "CA")
                .Replace("{{Sender_Zip}}", "90210")
                .Replace("{{bwblogo}}", "https://photos.angel.co/startups/i/671144-4afc5ed6e97f6fcd3e09ce43d1da2c73-medium_jpg.jpg?buster=1430952813")
                .Replace("{{msg1}}", msg1)
                .Replace("{{msg2}}", msg2);

            EmailAddress from = new EmailAddress("service@bodyworkbooker.com", "Example User");
            string subject = "Appointment Status Update - BodyWork";
            EmailAddress to = new EmailAddress(singleEvent.Email, "Example User");
            string plainTextContent = "Login to see the details of your appointment.";
            string htmlContent = fileHtml;

            SendGridMessage msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            return msg;
        }

        /// <summary>
        /// Send and email with Sendgrid
        /// </summary>
        /// <param name="msg">A SendGridMessage object that takes a from, to, subject, plaintext and or html content</param>
        /// <returns>true if email is sent out</returns>
        private async Task<bool> Send(SendGridMessage msg)
        {
            SendGridClient client = new SendGridClient(_appKeys.SendGridAppKey);
            await client.SendEmailAsync(msg);
            return true;
        }
    }
}
