export interface LoginErrorResult {
  emailError?: string;
  passwordError?: string;
  generalError?: string;
}

export function getFirebaseLoginError(code: string): LoginErrorResult {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return {
        generalError: "Incorrect email or password. Please try again.",
      };

    case "auth/invalid-email":
      return {
        emailError: "The email format is invalid.",
      };

    case "auth/too-many-requests":
      return {
        generalError: "Too many failed login attempts. Please try again later.",
      };

    default:
      return {
        generalError:
          "Unable to sign in right now. Please check your internet connection.",
      };
  }
}
