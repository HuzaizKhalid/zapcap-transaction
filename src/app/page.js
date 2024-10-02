"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload and transcribe video");
      }

      setTranscription(data.transcription);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center">
                Video Transcription
              </h1>
            </div>
            <div className="divide-y divide-gray-200">
              <form
                onSubmit={handleSubmit}
                className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7"
              >
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12 text-gray-400 group-hover:text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        {selectedFile ? selectedFile.name : "Select a video"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="opacity-0"
                      accept="video/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isLoading || !selectedFile}
                    className={`px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline ${
                      isLoading || !selectedFile
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isLoading ? "Processing..." : "Upload and Transcribe"}
                  </button>
                </div>
              </form>
              {error && <p className="text-red-500 text-center">{error}</p>}
              {transcription && (
                <div className="py-8">
                  <h2 className="text-xl font-semibold mb-2">Transcription:</h2>
                  <p className="text-gray-600">{transcription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
