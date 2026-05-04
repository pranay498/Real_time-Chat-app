import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  const JWT_SECRET = process.env.JWT_SECRET as string; // ← function ke andar lao
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: "15d" });
};