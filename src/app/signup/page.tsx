import { redirect } from "next/navigation";

/**
 * Signup is disabled for now — redirect to login.
 * Will be enabled in a future phase.
 */
export default function SignupPage() {
  redirect("/login");
}
