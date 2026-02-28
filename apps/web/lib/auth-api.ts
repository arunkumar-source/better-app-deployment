import { auth } from "./auth-client";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await auth.signUp.email({
    name,
    email,
    password,
  });
  if (res.error) {
    throw new Error(res.error.message);
  }
  return res;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await auth.signIn.email({
      email,
      password,
    });
    if (res.error) {
      throw new Error(res.error.message);
    }
    return res;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login");
  }
};

export const logoutUser = async () => {
  try {
    const _res = await auth.signOut();
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to logout");
  }
};
