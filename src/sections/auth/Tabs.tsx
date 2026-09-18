"use client";

import { Card, Tabs } from "@heroui/react";
import { AuthForm, AuthField } from "./Form";
import { loginUser, registerUser } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { delius } from "@/utils/fonts";

const nameField: AuthField = {
  name: "name",
  label: "Full Name",
  type: "text",
  placeholder: "John Doe",
  required: true,
  minLength: 1,
};

const emailField: AuthField = {
  name: "email",
  label: "Email Address",
  type: "email",
  placeholder: "john@example.com",
  required: true,
  minLength: 5,
  validate: (value: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
};

const passwordField: AuthField = {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "••••••••",
  required: true,
  minLength: 6,
};

export default function AuthTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupID = searchParams.get("groupID");
  const redirectUrl = searchParams.get("redirectUrl");

  function navigateAfterAuth() {
    if (groupID) {
      router.push(`/?groupID=${groupID}`);
    } else if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push("/");
    }
    router.refresh();
  }

  async function submitRegister(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await registerUser(name, email, password);
      toast.success("Account created successfully! Welcome to OweSome.");
      navigateAfterAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    }
  }

  async function submitLogin(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { name } = await loginUser(email, password);
      toast.success(`Welcome back, ${name}!`);
      navigateAfterAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid email or password");
    }
  }

  return (
    <div className={`w-full ${delius.className}`}>
      <Tabs defaultSelectedKey={groupID ? "register" : "login"} className="w-full">
        <Tabs.ListContainer className="w-full">
          <Tabs.List className="w-full grid grid-cols-2">
            <Tabs.Tab id="login" className="text-center py-2.5 font-medium cursor-pointer">
              Login
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="register" className="text-center py-2.5 font-medium cursor-pointer">
              Register
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel className="pt-4" id="login">
          <Card className="p-6 border border-border bg-background shadow-sm rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-default-foreground">
              Welcome Back
            </h2>
            <AuthForm
              submitText="Log In"
              fields={[emailField, passwordField]}
              onSubmit={submitLogin}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel className="pt-4" id="register">
          <Card className="p-6 border border-border bg-background shadow-sm rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-default-foreground">
              Create an Account
            </h2>
            <AuthForm
              submitText="Sign Up"
              fields={[nameField, emailField, passwordField]}
              onSubmit={submitRegister}
            />
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}