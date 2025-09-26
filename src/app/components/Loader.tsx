"use client";

import { ClipLoader } from "react-spinners";

type LoaderProps = {
  message?: string;
  size?: number;
};

export default function Loader({ message = "Loading...", size = 45 }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-60 w-full text-center">
      <ClipLoader color="#6366F1" size={size} />
      <p className="mt-4 text-sm text-gray-600 animate-pulse">{message}</p>
    </div>
  );
}
