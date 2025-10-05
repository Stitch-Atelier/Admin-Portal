// SIGNUP
export type SignupReq = {
  firstname: string;
  lastname: string;
  mobile: string;
  isVerified: boolean;
};

// LOGIN
export type LoginReq = {
  mobile: string;
};
export type ValidateOTPReq = {
  otp: string;
};

// USER
export type UserType = {
  id: string | null;
  firstname: string | null;
  lastname: string | null;
  role: string | null;
  mobile: string | null;
  createdAt: string | null;
  isVerified: boolean | null;
};

// LOGIN RESPONSE
export interface LoginRes {
  message: string | null;
  user: UserType;
  authToken: string | null;
}
