import React from "react";

const FileUpload = ({ onDataLoaded }) => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();

      // Send full backend response to parent
      onDataLoaded(result);

    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="file-upload">
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default FileUpload;
