import axios from "axios";
import React, { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { Loader, Upload, FileText, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Import styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const MyResume = () => {
    const { backendUrl, userData, setUserData } = useContext(AppContext);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const search = new URLSearchParams(window.location.search)
    const isRef = search.get('focusField')
    const fileInputRef = useRef();

    // PDF fetch state
    const [resolvedPdf, setResolvedPdf] = useState(null);

    useEffect(() => {
        // Clean old url
        return () => {
            if (resolvedPdf) URL.revokeObjectURL(resolvedPdf);
        };
    }, [resolvedPdf]);

    useEffect(() => {
        if (isRef) {
            fileInputRef.current.click();
        }
    }, [isRef]);

    const changeResume = async (resume) => {
        if (!resume) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(resume.type)) {
            toast.error('Please upload a PDF or Word document');
            return;
        }

        // Validate file size (5MB)
        if (resume.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append("resume", resume);
        setUploading(true);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/updateresume`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setUserData(data.profile);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) changeResume(file);
    };


    return (
        <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
            <div className="">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-6">
                    My Resume
                </h1>

                {/* Resume Preview Section */}
                {userData?.resume && (
                    <div className="mb-8">
                        {/* PDF Preview with react-pdf */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <iframe
                                src={userData.resume}
                                width="100%"
                                height="600"
                                className="rounded-xl border"
                                title="PDF Viewer"
                            />
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        {userData?.resume ? 'Update Resume' : 'Upload Resume'}
                    </h3>

                    <div
                        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${dragOver
                            ? "border-[var(--primary-color)] bg-blue-50"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                        }}
                        onDrop={handleDrop}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader className="w-12 h-12 animate-spin text-[var(--primary-color)]" />
                                <span className="text-lg font-medium text-gray-700">Uploading your resume...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-blue-50 rounded-full">
                                    <Upload className="w-10 h-10 text-[var(--primary-color)]" />
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => changeResume(e.target.files[0])}
                            disabled={uploading}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};

export default MyResume;
