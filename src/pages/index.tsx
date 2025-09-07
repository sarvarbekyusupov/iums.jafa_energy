import { lazy } from "react";

const SignIn = lazy(() => import("./auth/sign-in"));
const SignUp = lazy(() => import("./auth/sign-up"));
const ActivateAccount = lazy(() => import("./auth/activate-account"));
const ResetPassword = lazy(() => import("./auth/reset-password"));
const ForgotPassword = lazy(() => import("./auth/forgot-password"));
const NotFound = lazy(() => import("./not-found/not-found"));
const LayoutProtect = lazy(() => import("./protected-rotes/layout-protect"));
const LoginProtect = lazy(() => import("./protected-rotes/login-protect"));

export { 
  SignIn, 
  SignUp, 
  ActivateAccount, 
  ResetPassword, 
  ForgotPassword, 
  NotFound, 
  LayoutProtect, 
  LoginProtect 
};
