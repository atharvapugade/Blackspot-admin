"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BlackspotsList() {
    const [blackspots, setBlackspots] = useState([]);
    const [filteredBlackspots, setFilteredBlackspots] = useState([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);

    const adminEmail =
        typeof window !== "undefined" ? localStorage.getItem("adminEmail") : null;
    const adminPass =
        typeof window !== "undefined" ? localStorage.getItem("adminPass") : null;

    useEffect(() => {
        if (!adminEmail || !adminPass) {
            router.push("/admin/login");
            return;
        }

        const unsub = onSnapshot(collection(db, "blackspots"), (snap) => {
            const list = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
            setBlackspots(list);
            setLoading(false);
        });

        return () => unsub();
    }, [router, adminEmail, adminPass]);

    // Handle search functionality
    useEffect(() => {
        const searchQuery = searchParams.get("search")?.toLowerCase() || "";
        if (searchQuery) {
            const filtered = blackspots.filter(blackspot =>
                blackspot.name?.toLowerCase().includes(searchQuery) ||
                blackspot.reason?.toLowerCase().includes(searchQuery) ||
                blackspot.latitude?.toString().includes(searchQuery) ||
                blackspot.longitude?.toString().includes(searchQuery)
            );
            setFilteredBlackspots(filtered);
        } else {
            setFilteredBlackspots(blackspots);
        }
    }, [blackspots, searchParams]);

    const deleteBlackspot = async (id) => {
        try {
            const ref = doc(db, "blackspots", id);

            // Step 1: authorize admin (same as Android update(auth))
            await updateDoc(ref, {
                adminEmail,
                adminPass,
            });

            // Step 2: delete
            await deleteDoc(ref);

            alert("Deleted Successfully");
        } catch (e) {
            alert("Failed to delete: " + e.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-800 mb-2">Blackspots Management</h1>
                        <p className="text-blue-600">Monitor and manage road safety blackspots</p>
                        {searchParams.get("search") && (
                            <p className="text-sm text-blue-500 mt-1">
                                Showing results for: "{searchParams.get("search")}"
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => router.push("/admin/add")}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                    >
                        <span>Add Blackspot</span>
                    </button>
                </div>

                {filteredBlackspots.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-blue-100">
                        <h3 className="text-xl font-semibold text-blue-800 mb-2">
                            {searchParams.get("search") ? "No Results Found" : "No Blackspots Found"}
                        </h3>
                        <p className="text-blue-600 mb-6">
                            {searchParams.get("search")
                                ? "Try adjusting your search terms or add a new blackspot."
                                : "Start by adding your first road safety monitoring point."
                            }
                        </p>
                        <div className="flex gap-3 justify-center">
                            {searchParams.get("search") && (
                                <button
                                    onClick={() => router.push("/admin/blackspots")}
                                    className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                            <button
                                onClick={() => router.push("/admin/add")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Add First Blackspot
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                            <div className="grid grid-cols-12 gap-4 font-semibold text-blue-800">
                                <div className="col-span-3">Name</div>
                                <div className="col-span-3">Reason</div>
                                <div className="col-span-2">Location</div>
                                <div className="col-span-2">Radius</div>
                                <div className="col-span-2">Actions</div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-blue-100">
                            {filteredBlackspots.map((b) => (
                                <div key={b.id} className="px-6 py-4 hover:bg-blue-50/50 transition-colors">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-3">
                                            <h3 className="font-semibold text-blue-800">{b.name}</h3>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="text-blue-600 text-sm">{b.reason}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-xs text-blue-500">
                                                <div>Lat: {b.latitude}</div>
                                                <div>Lng: {b.longitude}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {b.radius}m
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/admin/edit?id=${b.id}`)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center space-x-1"
                                                >
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedId(b.id);
                                                        setShowConfirm(true);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center space-x-1"
                                                >
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal - Centered on viewport */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]">
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 shadow-2xl border border-blue-100 max-w-md w-full mx-4 z-[101]">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-blue-800 mb-2">Confirm Delete</h2>
                            <p className="text-blue-600">
                                Are you sure you want to delete this blackspot? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    setSelectedId(null);
                                }}
                                className="flex-1 py-3 px-4 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    await deleteBlackspot(selectedId);
                                    setShowConfirm(false);
                                    setSelectedId(null);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
