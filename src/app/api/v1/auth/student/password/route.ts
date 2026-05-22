import { NextRequest } from "next/server";
import { handlePatch } from "@/app/api/handlers";

export async function PATCH(req: NextRequest) {
  return await handlePatch(req, "/api/v1/auth/student/password", {
    isFormData: false,
  });
}
