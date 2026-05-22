"use client";
import apiClient from "@/app/server/utils/ApiClient";
import { useEffect } from "react";

interface Props {
  currentLocale: string;
}

const ApiClientLocaleSync: React.FC<Props> = ({ currentLocale }) => {
  useEffect(() => {
    apiClient.setLocale(currentLocale);
  }, [currentLocale]);
  return null;
};

export default ApiClientLocaleSync;
