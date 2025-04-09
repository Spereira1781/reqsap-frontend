
import React, { useState } from 'react'

function App() {
  const [fileURL, setFileURL] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(file)
      setFileURL(fileURL)
    } else {
      alert('Por favor, envie um arquivo PDF.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">SAP SPS - Upload e Visualização</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4" />
      {fileURL && (
        <iframe src={fileURL} className="w-full h-[80vh] border rounded shadow" title="PDF Viewer"></iframe>
      )}
    </div>
  )
}

export default App
