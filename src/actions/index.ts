import "server-only";

export {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "@/modules/auth/actions";
export type {
  RegisterState,
  LoginState,
  ForgotPasswordState,
  ResetPasswordState,
  VerifyEmailState,
} from "@/modules/auth/actions";
