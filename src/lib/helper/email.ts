import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendInviteEmail(inviter: string, to: string, groupName: string, groupID: ObjectId) {
  await transporter.sendMail({
    from: {
      name: "OweSome",
      address: process.env.EMAIL_USER!
    },
    to: to,
    subject: `Invitation to join group - ${groupName}`,
    html: sendInvitationTemplate(inviter, groupName, process.env.NEXT_PUBLIC_BASE_URL! + "/groups?groupID=" + groupID.toString()),
  });
}
