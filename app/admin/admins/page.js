"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    collection,
    onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminsList() {
    const [admins, setAdmins] = useState([]);
    const router = useRouter();
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

        const unsub = onSnapshot(
            collection(db, "admins"),
            (snap) => {
                const list = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setAdmins(list);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching admins:", error);
                setAdmins([]);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [router, adminEmail, adminPass]);

    if (loading) {
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
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">Admins Management</h1>
                    <p className="text-blue-600">Total Admins: {admins.length}</p>
                </div>
                <button
                    onClick={() => router.push("/admin/admins/add")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200"
                >
                    Add Admin
                </button>
            </div>

            {admins.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">No Admins Found</h3>
                    <p className="text-blue-600">No admin accounts have been registered yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                        <div className="grid grid-cols-3 gap-4 font-semibold text-blue-800">
                            <div className="col-span-1">Name</div>
                            <div className="col-span-1">Email</div>
                            <div className="col-span-1">Role</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-blue-100">
                        {admins.map((admin) => (
                            <div key={admin.id} className="px-6 py-4 hover:bg-blue-50/50 transition-colors">
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <div className="col-span-1">
                                        <p className="text-blue-800">{admin.name || "N/A"}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-blue-600">{admin.email || "N/A"}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {admin.role || "Admin"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}