import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import { useState } from "react";

interface SharedData {
  meta: {
    sharedBy: string;
    patientName: string;
    expiresAt: string;
    notes?: string;
  };
  data: {
    cases: any[];
    exams: any[];
    labs: any[];
  };
}

const ExternalConsultationView = () => {
  const { token } = useParams({ from: "/external/view/$token" });
  const [accessCode, setAccessCode] = useState("");
  const [isAccessCodeSubmitted, setIsAccessCodeSubmitted] = useState(false);
  const [accessCodeError, setAccessCodeError] = useState("");

  // If no token, show error
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔗</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600">
            This consultation link is malformed. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setAccessCodeError("Access code is required");
      return;
    }
    if (accessCode.length !== 6 || !/^\d+$/.test(accessCode)) {
      setAccessCodeError("Access code must be 6 digits");
      return;
    }
    setAccessCodeError("");
    setIsAccessCodeSubmitted(true);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["consultation", token, accessCode],
    queryFn: async () => {
      const API_URL = `http://localhost:3000/api`;
      const response = await axios.get(`${API_URL}/consults/view/${token}?accessCode=${accessCode}`);
      return response.data.data as SharedData; // Access the nested data property
    },
    retry: false, // Don't retry on auth errors
    enabled: isAccessCodeSubmitted && !!accessCode, // Only run query after access code is submitted
  });

  // Show access code input form if not submitted yet
  if (!isAccessCodeSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="text-blue-500 text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Code Required</h2>
            <p className="text-gray-600">
              Please enter the 6-digit access code provided by the clinician to view this consultation.
            </p>
          </div>

          <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              {accessCodeError && (
                <p className="mt-2 text-sm text-red-600">{accessCodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Access Consultation
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAccessCodeError = axios.isAxiosError(error) && error.response?.status === 403;
    const errorMessage = isAccessCodeError
      ? "Invalid access code. Please check the code and try again."
      : axios.isAxiosError(error) && error.response?.status === 404
      ? "This consultation link is invalid or has expired."
      : "Unable to load consultation data. Please try again later.";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isAccessCodeError ? "Invalid Access Code" : "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-4">
            {errorMessage}
          </p>
          {isAccessCodeError && (
            <button
              onClick={() => setIsAccessCodeSubmitted(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { meta, data: consultationData } = data;

  // Ensure we have the expected data structure
  if (!meta || !consultationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Data</h2>
          <p className="text-gray-600">
            The consultation data format is invalid. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Consultation</h1>
              <p className="text-gray-600 mt-1">
                Shared by: <span className="font-medium">{meta.sharedBy}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Expires: {new Date(meta.expiresAt).toLocaleString()}</p>
              <p className="text-sm text-gray-500">Patient: {meta.patientName}</p>
            </div>
          </div> && consultationData.cases
          {meta.notes && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Notes:</strong> {meta.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Cases */}
          {consultationData.cases.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Cases</h2>
              <div className="grid gap-6">
                {consultationData.cases.map((case_) => (
                  <div key={case_.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Case #{case_.id}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Diagnosis: {case_.diagnosisName || 'Not specified'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {case_.status} | Severity: {case_.severity}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        case_.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        case_.status === 'RECOVERED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {case_.status}
                      </span>
                    </div>

                    {/* Treatments */}
                    {case_.treatments && case_.treatments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Treatments</h4>
                        <div className="space-y-2">
                          {case_.treatments.map((treatment: any) => (
                            <div key={treatment.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {treatment.treatmentType}: {treatment.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Physio Programs */}
                    {case_.physioPrograms && case_.physioPrograms.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Physiotherapy Programs</h4>
                        <div className="space-y-2">
                          {case_.physioPrograms.map((program: any) => (
                            <div key={program.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {program.programName} - {program.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exams */}
          {consultationData.exams && consultationData.exams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Imaging Exams</h2>
              <div className="grid gap-6">
                {consultationData.exams.map((exam) => (
                  <div key={exam.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {exam.modality} - {exam.bodyPart}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Performed: {exam.performedAt ? new Date(exam.performedAt).toLocaleDateString() : 'Not performed'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {exam.status}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        exam.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        exam.status === 'ORDERED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.status}
                      </span>
                    </div>

                    {exam.conclusion && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Radiologist Conclusion</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {exam.conclusion}
                        </p>
                      </div>
                    )}

                    {/* DICOM Image */}
                    {exam.dicomPublicUrl && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">DICOM Image</h4>
                        <DicomViewerButton
                          dicomUrl={exam.dicomPublicUrl}
                          dicomFileName={exam.dicomFileName}
                          examId={exam.id}
                          modality={exam.modality}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Tests */}
          {consultationData.labs && consultationData.labs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Laboratory Tests</h2>
              <div className="grid gap-6">
                {consultationData.labs.map((lab) => (
                  <div key={lab.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {lab.testName}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Category: {lab.category || 'Not specified'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Sample Date: {new Date(lab.sampleDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lab.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        lab.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lab.status}
                      </span>
                    </div>

                    {lab.resultValues && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Test Results</h4>
                        <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(lab.resultValues, null, 2)}
                        </pre>
                      </div>
                    )}

                    {lab.resultPdfUrl && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Result PDF</h4>
                        <a
                          href={lab.resultPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View PDF Report
                        </a>
                      </div>
                    )}

                    {lab.labTechnicianNotes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Lab Technician Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {lab.labTechnicianNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!consultationData.cases || consultationData.cases.length === 0) &&
           (!consultationData.exams || consultationData.exams.length === 0) &&
           (!consultationData.labs || consultationData.labs.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                This consultation link doesn't include any medical data for review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalConsultationView;