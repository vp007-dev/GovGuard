import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, CheckCircle2, AlertTriangle, MapPin, RefreshCw, X } from 'lucide-react';

const ClaimSubmission = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        fund_id: '',
        amount: '',
        claimant_name: '',
        description: ''
    });

    const [cameraActive, setCameraActive] = useState(false);
    const [imageBlob, setImageBlob] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [locLoading, setLocLoading] = useState(false);
    const [locError, setLocError] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const startCamera = async () => {
        try {
            setCameraActive(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Also start fetching location immediately
            fetchLocation();

        } catch (err) {
            console.error("Camera Error:", err);
            // Fallback mechanism
            setCameraActive(false);
            // We will handle the error in the UI to show the fallback input
            setLocError("Camera/Location access requires HTTPS or Localhost.");
        }
    };

    const fetchLocation = (highAccuracy = true) => {
        setLocLoading(true);
        setLocError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    acc: pos.coords.accuracy
                });
                setLocLoading(false);
            },
            (err) => {
                console.warn("GPS Error:", err.message);
                if (highAccuracy) {
                    // Retry with low accuracy
                    console.log("Retrying with low accuracy...");
                    fetchLocation(false);
                } else {
                    setLocError("GPS Timeout. Please enable Location Services.");
                    setLocLoading(false);
                }
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            setImageBlob(blob);
            setImagePreview(URL.createObjectURL(blob));
            stopCamera();
        }, 'image/jpeg', 0.85);
    };

    const resetPhoto = () => {
        setImageBlob(null);
        setImagePreview(null);
        setLocation(null);
        setLocError(null); // Clear locError when resetting photo to allow camera retry
        startCamera();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageBlob) {
            alert("Please capture a live photo proof.");
            return;
        }
        if (!location) {
            if (!confirm("Location data is missing. Submit anyway? Risk score may increase.")) return;
        }

        setIsSubmitting(true);
        setResult(null);

        const data = new FormData();
        data.append("fund_id", formData.fund_id);
        data.append("amount", formData.amount);
        data.append("claimant_name", formData.claimant_name);
        data.append("description", formData.description);

        data.append("file", imageBlob, "live_capture.jpg");

        if (location) {
            data.append("latitude", location.lat);
            data.append("longitude", location.lng);
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/submit-claim`, {
                method: "POST",
                body: data
            });
            const json = await response.json();
            setResult(json);
            if (json.success && onSuccess) {
                onSuccess(json);
            }
        } catch (err) {
            setResult({ success: false, error: "Network Error", details: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-blue-900 p-6 text-white">
                    <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                        <Camera size={24} className="text-emerald-400" />
                        Live Site Verification
                    </h2>
                    <p className="text-blue-200 text-xs mt-1">Geo-tagged live capture required for funds release.</p>
                </div>

                <div className="p-8">
                    {result && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                            {result.success ? <CheckCircle2 className="text-emerald-600 shrink-0" /> : <AlertTriangle className="text-red-600 shrink-0" />}
                            <div>
                                <h4 className={`font-bold text-sm ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                    {result.success ? 'Verification Successful' : 'Verification Failed'}
                                </h4>
                                <p className="text-xs mt-1 text-slate-600">{result.details || result.message || result.error}</p>
                                {result.warnings && result.warnings.length > 0 && (
                                    <p className="text-xs text-amber-700 font-bold mt-1">⚠ {result.warnings.join(", ")}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fund Allocation ID</label>
                                <input
                                    type="text"
                                    name="fund_id"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none font-mono text-sm"
                                    placeholder="e.g. F-2025-101"
                                    value={formData.fund_id}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount Utilized (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none font-mono text-sm"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Claimant Name</label>
                            <input
                                type="text"
                                name="claimant_name"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                                placeholder="Name of entity"
                                value={formData.claimant_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Work Description</label>
                            <textarea
                                name="description"
                                required
                                rows="2"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                                placeholder="Proof description..."
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Live Proof Capture</label>
                            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-300 relative min-h-[250px] flex flex-col items-center justify-center">

                                {/* 1. Initial State: No Camera */}
                                {!cameraActive && !imagePreview && (
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                                            <Camera size={28} />
                                        </div>

                                        {locError ? (
                                            <div className="mb-4">
                                                <p className="text-red-500 text-xs font-bold mb-2">Camera API Unavailable (Browser Restriction)</p>
                                                <p className="text-[10px] text-slate-500 mb-3">Please use the button below to take a photo using your device's native camera.</p>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    className="hidden"
                                                    id="native-camera"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            const f = e.target.files[0];
                                                            setImageBlob(f);
                                                            setImagePreview(URL.createObjectURL(f));

                                                            // Try fetching location again separately
                                                            fetchLocation();
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="native-camera"
                                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold uppercase text-xs hover:bg-emerald-700 transition-colors cursor-pointer inline-block"
                                                >
                                                    Open Device Camera
                                                </label>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={startCamera}
                                                className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold uppercase text-xs hover:bg-blue-800 transition-colors"
                                            >
                                                Open Camera
                                            </button>
                                        )}

                                        {!locError && (
                                            <p className="text-[10px] text-slate-500 mt-3 max-w-xs mx-auto">
                                                Requires Camera & Location permissions. Image will be geo-tagged automatically.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 2. Active Camera Stream */}
                                {cameraActive && (
                                    <div className="relative w-full h-full flex flex-col items-center bg-black">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-64 object-cover"
                                        ></video>
                                        <div className="absolute bottom-4 flex gap-4 items-center w-full justify-center px-4">
                                            {locLoading ? (
                                                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-[10px] flex items-center gap-2 backdrop-blur-md">
                                                    <Loader2 size={10} className="animate-spin" /> Fetching GPS...
                                                </div>
                                            ) : location ? (
                                                <div className="bg-emerald-500/80 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border border-emerald-400">
                                                    <MapPin size={10} /> GPS LOCKED
                                                </div>
                                            ) : locError ? (
                                                <div className="bg-red-500/80 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                                                    <X size={10} /> GPS FAIL
                                                </div>
                                            ) : null}

                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="w-12 h-12 bg-white rounded-full border-4 border-slate-200 shadow-lg hover:scale-105 transition-transform active:scale-95"
                                            ></button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Preview State */}
                                {imagePreview && (
                                    <div className="relative w-full">
                                        <img src={imagePreview} alt="Capture" className="w-full h-64 object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button type="button" onClick={resetPhoto} className="p-2 bg-black/60 text-white rounded-full hover:bg-black/80 backdrop-blur">
                                                <RefreshCw size={14} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur p-2 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                <MapPin size={12} className={location ? "text-emerald-600" : "text-red-500"} />
                                                {location ? (
                                                    <span>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                                                ) : <span>Location Missing</span>}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-mono">
                                                ±{location?.acc?.toFixed(0) || '?'}m
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Hidden Canvas for capture */}
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !imageBlob}
                            className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Verified Claim'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClaimSubmission;
