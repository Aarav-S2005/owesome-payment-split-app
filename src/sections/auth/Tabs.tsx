"use client";

import { Card, Tabs } from "@heroui/react";
import { AuthForm } from "./Form";
import {loginUser, registerUser} from "@/lib/actions/auth.actions";
import {AuthField} from "@/sections/auth/Form";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const nameField: AuthField = {
  name: "name",
  label: "Name",
  type: "text",
  placeholder: "Name",
  required: true,
  minLength: 1,
}

const emailField: AuthField = {
  name: "email",
  label: "Email",
  type: "email",
  placeholder: "john@example.com",
  required: true,
  minLength: 5,
  validate: (value: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
};

const passwordField: AuthField = {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  required: true,
  minLength: 8,
  validate: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
}

export default function AuthTabs() {

  const router = useRouter();

  async function submitRegister(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await registerUser(name, email, password);
      await redirectToHome()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function submitLogin(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const {name} = await loginUser(email, password);
      localStorage.setItem("name", name);
      await redirectToHome();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function redirectToHome(){
    router.push("/")
  }

  return (
    <Tabs>
      <Tabs.ListContainer>
        <Tabs.List>
          <Tabs.Tab id="register">
            Register
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="login">
            Login
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

        <Tabs.Panel className="pt-4" id="register">
          <Card className={""}>
            <Card.Title>
              Register
            </Card.Title>
            <AuthForm fields={[
              nameField,
              emailField,
              passwordField,
            ]} onSubmit={submitRegister} />
          </Card>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="login">
          <Card className={""}>
            <Card.Title>
              Register
            </Card.Title>
            <AuthForm fields={[
              emailField,
              passwordField,
            ]} onSubmit={submitLogin} />
          </Card>
        </Tabs.Panel>

    </Tabs>
  )
}