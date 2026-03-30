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
                        import { Suspense } from "react";
                        import BlackspotsList from "./BlackspotsList";

                        export default function Page() {
                          return (
                            <Suspense fallback={<div>Loading...</div>}>
                              <BlackspotsList />
                            </Suspense>
                          );
                        }

