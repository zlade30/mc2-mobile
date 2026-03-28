import type { User } from "@/features/auth/types";

export const DEMO_EMAIL_CUSTOMER = "demo@demo.com";
export const DEMO_EMAIL_STAFF = "staff@demo.com";
export const DEMO_PASSWORD = "demo";

export function isDemoCredentials(login: string, password: string): boolean {
  const email = login.trim().toLowerCase();
  return (
    (email === DEMO_EMAIL_CUSTOMER || email === DEMO_EMAIL_STAFF) &&
    password === DEMO_PASSWORD
  );
}

export function isDemoUser(user: User | null): boolean {
  if (!user?.email) return false;
  const email = user.email.trim().toLowerCase();
  return email === DEMO_EMAIL_CUSTOMER || email === DEMO_EMAIL_STAFF;
}

export function getDemoRole(login: string): "customer" | "staff" {
  return login.trim().toLowerCase() === DEMO_EMAIL_STAFF ? "staff" : "customer";
}

const now = new Date().toISOString();

export function getMockDemoUser(role: "customer" | "staff"): User {
  const isCustomer = role === "customer";
  return {
    id: isCustomer ? 9001 : 9002,
    name: isCustomer ? "Mary Jane" : "John Doe",
    username: isCustomer ? "maryjane" : "johndoe",
    email: isCustomer ? DEMO_EMAIL_CUSTOMER : DEMO_EMAIL_STAFF,
    phone: "+15550000000",
    avatar: null,
    hashed_id: "demo-hashed-id-" + role,
    roles: [
      {
        id: 1,
        name: role,
        display_name: role === "customer" ? "Customer" : "Staff",
        description: "",
        permissions: [],
      },
    ],
    email_verified_at: now,
    loyalty_point: isCustomer
      ? {
          total_points: 240,
          lifetime_points: 500,
        }
      : null,
    reward_progress: isCustomer
      ? [
          {
            rule_id: "1",
            name: "Free Coffee",
            reward_title: "Free Medium Coffee",
            points_required: 100,
            current_points: 240,
            points_remaining: 0,
            progress_percentage: 100,
          },
        ]
      : null,
    created_at: now,
  };
}
