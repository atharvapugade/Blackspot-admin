"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    query,
    where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function BlackspotDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [blackspot, setBlackspot] = useState(null);
    const [detections, setDetections] = useState([]);
    const [filteredDetections, setFilteredDetections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState("12:00 AM");
    const [endTime, setEndTime] = useState("11:59 PM");

    useEffect(() => {
        if (!id) return;

        let unsubDetections = null;

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/admin/login");
                return;
            }

            // Fetch blackspot details
            const fetchBlackspot = async () => {
                const docRef = doc(db, "blackspots", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBlackspot({ id: docSnap.id, ...docSnap.data() });
                } else {
                    alert("Blackspot not found");
                    router.push("/admin/dashboard");
                }
            };

            // Fetch detections for this blackspot
            unsubDetections = onSnapshot(
                query(collection(db, "detections"), where("blackspotId", "==", id)),
                (snap) => {
                    const list = snap.docs.map((d) => ({
                        id: d.id,
                        ...d.data(),
                    }));
                    setDetections(list);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching detections:", error);
                    if (error?.code === "permission-denied") {
                        alert("Access denied for detections. Please check Firestore admin read rules.");
                    }
                    setDetections([]);
                    setLoading(false);
                }
            );

            fetchBlackspot();
        });

        return () => {
            unsubAuth();
            if (unsubDetections) {
                unsubDetections();
            }
        };
    }, [router, id]);

    const timeToHour = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour = hours;
        if (period === 'PM' && hours !== 12) hour += 12;
        if (period === 'AM' && hours === 12) hour = 0;
        return hour;
    };

    // Filter detections based on time
    useEffect(() => {
        const startHour = timeToHour(startTime);
        const endHour = timeToHour(endTime);
        const filtered = detections.filter((detection) => {
            if (!detection.timestamp) return true;
            const date = detection.timestamp.toDate ? detection.timestamp.toDate() : new Date(detection.timestamp);
            const hour = date.getHours();
            return hour >= startHour && hour <= endHour;
        });
        setFilteredDetections(filtered);
    }, [detections, startTime, endTime]);

    if (loading || !blackspot) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">{blackspot.name} Details</h1>
                    <p className="text-blue-600">Monitor user activity at this blackspot</p>
                </div>
                <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Blackspot Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-4">Blackspot Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-blue-600">Name</p>
                        <p className="text-blue-800">{blackspot.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-600">Reason</p>
                        <p className="text-blue-800">{blackspot.reason}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-600">Location</p>
                        <p className="text-blue-800">Lat: {blackspot.latitude}, Lng: {blackspot.longitude}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-600">Radius</p>
                        <p className="text-blue-800">{blackspot.radius}m</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-4">Filter by Time</h2>
                <div className="flex gap-4 items-center">
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-1">Start Time</label>
                        <select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: 24 }, (_, i) => {
                                const hour = i % 12 || 12;
                                const period = i < 12 ? 'AM' : 'PM';
                                return (
                                    <option key={i} value={`${hour}:00 ${period}`}>
                                        {hour}:00 {period}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-1">End Time</label>
                        <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: 24 }, (_, i) => {
                                const hour = i % 12 || 12;
                                const period = i < 12 ? 'AM' : 'PM';
                                return (
                                    <option key={i} value={`${hour}:00 ${period}`}>
                                        {hour}:00 {period}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* Detections Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-4">User Activity Summary</h2>
                <p className="text-blue-600">Total users passed: <span className="font-bold text-blue-800">{filteredDetections.length}</span></p>
            </div>

            {/* Detections List */}
            {filteredDetections.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">No User Activity Found</h3>
                    <p className="text-blue-600">No users have passed through this blackspot in the selected time range.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                        <div className="grid grid-cols-6 gap-3 font-semibold text-blue-800 text-sm">
                            <div className="col-span-1">User/Device ID</div>
                            <div className="col-span-1">Contact Info</div>
                            <div className="col-span-1">IP Address</div>
                            <div className="col-span-1">Speed</div>
                            <div className="col-span-1">Time</div>
                            <div className="col-span-1">Status</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-blue-100 max-h-96 overflow-y-auto">
                        {filteredDetections.map((detection) => {
                            const date = detection.timestamp?.toDate ? detection.timestamp.toDate() : new Date(detection.timestamp);
                            const isRegisteredUser = detection.userEmail ? true : false;
                            const displayName = detection.userName || (detection.deviceId ? `Device: ${detection.deviceId.substring(0, 8)}...` : "Unknown");
                            const displayEmail = detection.userEmail || (detection.ipAddress ? `IP: ${detection.ipAddress}` : "N/A");
                            const speedValue = detection.speed || 0;
                            const isOverSpeeding = speedValue > 60; // Threshold for over-speeding
                            
                            return (
                                <div key={detection.id} className="px-6 py-4 hover:bg-blue-50/50 transition-colors border-b border-blue-100">
                                    <div className="grid grid-cols-6 gap-3 items-center text-sm">
                                        <div className="col-span-1">
                                            <p className="text-blue-800 font-medium">{displayName}</p>
                                            <p className="text-xs text-blue-500">{isRegisteredUser ? "Registered" : "Unregistered"}</p>
                                        </div>
                                        <div className="col-span-1">
                                            <p className="text-blue-600 break-all">{displayEmail}</p>
                                        </div>
                                        <div className="col-span-1">
                                            <p className="text-blue-600 font-mono text-xs">{detection.ipAddress || "N/A"}</p>
                                        </div>
                                        <div className="col-span-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                                isOverSpeeding 
                                                  ? "bg-red-100 text-red-800" 
                                                  : "bg-blue-100 text-blue-800"
                                            }`}>
                                                {speedValue} km/h
                                            </span>
                                        </div>
                                        <div className="col-span-1">
                                            <p className="text-blue-600 text-xs">{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                            <p className="text-blue-500 text-xs">{date.toLocaleDateString()}</p>
                                        </div>
                                        <div className="col-span-1 text-center">
                                            {isOverSpeeding && !isRegisteredUser ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">
                                                    Alert
                                                </span>
                                            ) : isOverSpeeding ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
                                                    Warning
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                                                    Normal
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}