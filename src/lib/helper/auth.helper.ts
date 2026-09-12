import jwt, {JwtPayload} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
export const COOKIE_TOKEN_KEY = "auth-token";

export interface CustomJwtPayload extends JwtPayload {
  email: string;
}

export const signJwt = (email: string): string => {
  return jwt.sign({email: email}, JWT_SECRET, {expiresIn: "7d"});
}

export const verifyToken = (token: string): CustomJwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as CustomJwtPayload;
  } catch (error) {
    return null;
  }
};