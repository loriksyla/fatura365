import {
  confirmResetPassword,
  confirmSignUp,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { AppUser } from '../types';

export const getSessionUser = async (): Promise<AppUser | null> => {
  try {
    const user = await getCurrentUser();
    return {
      id: user.userId,
      name: user.signInDetails?.loginId?.split('@')[0] || 'Përdorues',
      email: user.signInDetails?.loginId || '',
    };
  } catch {
    return null;
  }
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const response = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
      },
    },
  });

  return response.nextStep;
};

export const confirmRegistration = async (email: string, code: string) => {
  return confirmSignUp({
    username: email,
    confirmationCode: code,
  });
};

export const loginWithEmail = async (email: string, password: string) => {
  return signIn({ username: email, password });
};

export const logoutUser = async () => {
  await signOut();
};

export const startForgotPassword = async (email: string) => {
  return resetPassword({ username: email });
};

export const completeForgotPassword = async (email: string, code: string, newPassword: string) => {
  return confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
};
