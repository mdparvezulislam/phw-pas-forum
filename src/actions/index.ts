import "server-only";

export type {
  ForgotPasswordState,
  LoginState,
  RegisterState,
  ResetPasswordState,
  VerifyEmailState,
} from "@/modules/auth/actions";
export {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from "@/modules/auth/actions";
