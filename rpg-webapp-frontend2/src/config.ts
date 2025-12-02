// src/config.ts

const apiUrl = import.meta.env.VITE_API_URL;

console.log("VITE_API_URL from env =", apiUrl); // <- tymczasowo, do debugowania

if (!apiUrl) {
  throw new Error("VITE_API_URL is not defined in .env");
}

export const API_URL = apiUrl as string;
