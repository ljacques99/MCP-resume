import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setStatus('Please upload a PDF file');
      return;
    }
    
    setFileName(file.name);
    setStatus(`Ready to process: ${file.name}`);
    setResumeText(''); // Clear text input when PDF is selected
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/pdf',
    multiple: false
  });

  const handleTextChange = (e) => {
    setResumeText(e.target.value);
    if (e.target.value.trim()) {
      setFileName(''); // Clear PDF selection when text is entered
    }
  };

  const generateSummary = async () => {
    if (!resumeText.trim() && !fileName) {
      setStatus('Please provide a resume');
      return;
    }

    setIsLoading(true);
    setStatus('Generating summary...');
    setSummary('Processing...');

    try {
      let response;
      
      if (fileName) {
        // Handle PDF file upload
        const formData = new FormData();
        const fileInput = document.querySelector('input[type="file"]');
        formData.append('resume', fileInput.files[0]);
        
        response = await axios.post('/generate-summary', formData);
      } else {
        // Handle text input
        response = await axios.post('/generate-summary', { text: resumeText.trim() });
      }

      setSummary(response.data.summary);
      setStatus('Summary generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      setSummary(`Error generating summary: ${error.message}`);
      setStatus('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">AI Resume Summary Generator</h1>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-6 
          ${isDragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the PDF file here...</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop your resume PDF here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">(Only PDF files accepted)</p>
          </div>
        )}
      </div>
      
      {fileName && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
          <p className="text-green-800">Selected file: <span className="font-medium">{fileName}</span></p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Or paste resume text:</h3>
        <textarea
          value={resumeText}
          onChange={handleTextChange}
          placeholder="Alternatively, paste your resume text here..."
          className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={generateSummary}
        disabled={isLoading || (!resumeText.trim() && !fileName)}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white
          ${(isLoading || (!resumeText.trim() && !fileName)) 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? 'Generating...' : 'Generate Professional Summary'}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded-lg 
          ${status.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
          {status}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Generated Summary:</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap">
          {summary || 'Your professional summary will appear here...'}
        </div>
      </div>
    </div>
  );
}

export default App;
