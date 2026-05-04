import amqp from "amqplib";
import nodemailer from "nodemailer";

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    const channel = await connection.createChannel();
    const queueName = "send-otp";

    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ Mail Service consumer started");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
           const parsed = JSON.parse(msg.content.toString());
      console.log("📨 Message received:", parsed); // ← add karo
      
      const { to, subject, body } = parsed;
      
      console.log("TO:", to);         // ← add karo
      console.log("SUBJECT:", subject); // ← add karo
      console.log("BODY:", body);

          console.log("EMAIL USER:", process.env.MAIL_USER);
          console.log(
            "EMAIL PASS:",
            process.env.MAIL_PASSWORD ? "Loaded ✅" : "Missing ❌",
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD,
            },
          });

          // 🔥 verify before sending
          await transporter.verify();

          console.log("SMTP working ✅");

          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            text: body,
          });

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("❌ Failed to send otp", error);
        }
      }
    });
  } catch (error) {
    console.log("❌ Failed to start rabbitmq consumer", error);
  }
};
