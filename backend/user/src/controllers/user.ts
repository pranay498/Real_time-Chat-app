import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;
  console.log("--- Login Request Start ---");
  console.log("Email received:", email);

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  console.log("Rate limit check for", rateLimitKey, ":", rateLimit ? "Limited ❌" : "OK ✅");

  if (rateLimit) {
    res.status(429).json({
      message: "Too may requests. Please wait before requesting new opt",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);

  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, {
    EX: 300,
  });
  console.log("OTP stored in Redis at key:", otpKey);

  await redisClient.set(rateLimitKey, "true", {
    EX: 60,
  });

  const message = {
    to: email,
    subject: "Your otp code",
    body: `Your OTP is ${otp}. It is valid for 5 minutes`,
  };

  console.log("Publishing to RabbitMQ 'send-otp' queue...");
  await publishToQueue("send-otp", message);
  console.log("Message published ✅");

  res.status(200).json({
    message: "OTP sent to your mail",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;
  console.log("--- Verify Request Start ---");
  console.log("Payload:", { email, enteredOtp });

  if (!email || !enteredOtp) {
    console.log("Missing fields ❌");
    res.status(400).json({
      message: "Email and OTP Required",
    });
    return;
  }

  const otpKey = `otp:${email}`;
  console.log("Checking Redis key:", otpKey);
  const storedOtp = await redisClient.get(otpKey);
  console.log("Stored OTP in Redis:", storedOtp);

  if (!storedOtp || storedOtp !== enteredOtp) {
    console.log("OTP Mismatch or Expired ❌ (Entered:", enteredOtp, "Stored:", storedOtp, ")");
    res.status(400).json({
      message: "Invalid or expired OTP",
    });
    return;
  }

  console.log("OTP Match ✅. Deleting key from Redis...");
  await redisClient.del(otpKey);

  console.log("Finding user in Database...");
  let user = await User.findOne({ email });

  if (!user) {
    console.log("User not found. Creating new user...");
    const name = email.slice(0, 8);
    user = await User.create({ name, email });
    console.log("New user created:", user._id);
  } else {
    console.log("Found existing user:", user._id);
  }

  console.log("Generating Token...");
  const token = generateToken(user);
  console.log("Token generated ✅");

  res.json({
    message: "User Verified",
    user,
    token,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  res.json(user);
});

export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404).json({
      message: "Please login",
    });
    return;
  }

  user.name = req.body.name;

  await user.save();

  const token = generateToken(user);

  res.json({
    message: "User Updated",
    user,
    token,
  });
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find();

  res.json(users);
});

export const getAUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.json(user);
});
