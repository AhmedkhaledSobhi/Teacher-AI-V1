"use server";

// Server Actions for Curriculum

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import apiServer from "@/app/server/utils/ApiServer";

export interface StrategyPrice {
  id: string;
  priceTypeId: string;
  strategyId: string;
  salePrice: number;
  profit: number;
  profitPercent: number;
  priceTypeName: string | null;
  strategyName: string | null;
}

interface Subject {
  // Define subject properties based on your needs
  // This is a placeholder based on the array structure you provided
  [key: string]: any;
}

interface CurriculumResponse {
  operation_status: string;
  message: string;
  grade: string;
  grade_id: number;
  total_subjects: number;
  data: any;
}

interface SingleCurriculumResponse {
  operation_status: string;
  message: string;
  data?: any;
  errors?: any;
  errorsMap?: any;
}

/**
 * Server action to get subjects for the authenticated student's grade
 * Uses GET /api/v1/grade/{grade_id}/subjects
 * @returns Promise<CurriculumResponse> - Subjects list for the grade
 */
export async function getCurriculumList(): Promise<CurriculumResponse> {
  try {
    // Get grade_id from session
    const session = await getServerSession(authOptions);
    const gradeId = (session?.user as any)?.grade_id ?? 1;

    // Make API call to get subjects for this grade
    const endpoint = `/api/v1/grade/${gradeId}/subjects`;
    const response = await apiServer.get(endpoint, undefined, {
      next: { tags: ["curriculum"] } as any,
    });

    const apiResponse = response.data as any;

    // Handle both direct array and wrapped responses
    if (apiResponse) {
      const subjects = Array.isArray(apiResponse)
        ? apiResponse
        : Array.isArray(apiResponse.data)
          ? apiResponse.data
          : Array.isArray(apiResponse.subjects)
            ? apiResponse.subjects
            : [];

      return {
        operation_status: "success",
        message: "Successfully retrieved subjects",
        grade: apiResponse.grade ?? "",
        grade_id: Number(gradeId),
        total_subjects: subjects.length,
        data: subjects,
      };
    }

    console.error("Invalid grade subjects API response:", apiResponse);
    return {
      operation_status: "error",
      message: "Failed to retrieve subjects",
      grade: "",
      data: [],
      grade_id: 0,
      total_subjects: 0,
    };
  } catch (error) {
    console.error("Error fetching grade subjects:", error);
    return {
      operation_status: "error",
      message: "Error fetching subjects data",
      grade: "",
      data: [],
      grade_id: 0,
      total_subjects: 0,
    };
  }
}

/**
 * Server action to get all units for a subject within a grade
 * Uses GET /api/v1/grade/{grade_id}/subject/{subject_id}/units
 * @param subjectId - Subject ID
 * @param gradeId - Optional grade ID (falls back to session grade_id)
 */
export async function getSubjectUnits(
  subjectId: number,
  gradeId?: number
): Promise<{ operation_status: string; data: any[] }> {
  try {
    // Get grade_id from session if not provided
    if (!gradeId) {
      const session = await getServerSession(authOptions);
      gradeId = (session?.user as any)?.grade_id ?? 1;
    }

    const response = await apiServer.get(
      `/api/v1/grade/${gradeId}/subject/${subjectId}/units?term_id=2`
    );
    const data = response.data as any;
    const items = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.units)
        ? data.units
        : Array.isArray(data)
          ? data
          : [];
    if (items.length > 0) {
      return { operation_status: "success", data: items };
    }
    return { operation_status: "error", data: [] };
  } catch (error) {
    console.error("Error fetching subject units:", error);
    return { operation_status: "error", data: [] };
  }
}

/**
 * Server action to get all lessons for a unit
 * @param unitId - Unit ID
 */
export async function getUnitLessons(
  unitId: number
): Promise<{ operation_status: string; data: any[] }> {
  try {
    const response = await apiServer.get(`/api/v1/unit/${unitId}/lessons`);
    const data = response.data as any;
    if (data?.operation_status === "success" && Array.isArray(data.data)) {
      return { operation_status: "success", data: data.data };
    }
    return { operation_status: "error", data: [] };
  } catch (error) {
    console.error("Error fetching unit lessons:", error);
    return { operation_status: "error", data: [] };
  }
}
