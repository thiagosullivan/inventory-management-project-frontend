import { generateUploadButton } from "@uploadthing/react";

export const UploadButton = generateUploadButton({
  url: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/uploadthing`
    : "http://localhost:3000/api/uploadthing",
});
