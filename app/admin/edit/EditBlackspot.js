"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditBlackspot() {
  const params = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const [loading, setLoading] = useState(true);

  const id = params?.get("id");
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("adminEmail") : null;
  const adminPass = typeof window !== "undefined" ? localStorage.getItem("adminPass") : null;

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        alert("No blackspot ID provided");
        router.push("/admin/dashboard");
        return;
      }

      if (!adminEmail || !adminPass) {
        setLoading(false);
        alert("Admin authentication required");
        router.push("/admin/login");
        return;
      }

      try {
        const ref = doc(db, "blackspots", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const d = snap.data();
          setName(d.name || "");
          setReason(d.reason || "");
          setLatitude(d.latitude || "");
          setLongitude(d.longitude || "");
          setRadius(d.radius || "");
        } else {
          alert("Blackspot not found");
          router.push("/admin/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error loading blackspot:", error);
        alert("Error loading blackspot data");
        router.push("/admin/dashboard");
        return;
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, [id, adminEmail, adminPass]);

  const saveBlackspot = async () => {
    if (!name || !reason || !latitude || !longitude || !radius) {
      alert("Please fill all fields");
      return;
    }
    try {
      await setDoc(doc(db, "blackspots", id), {
        name,
        reason,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        adminEmail,
        adminPass,
      });
      alert("Blackspot updated!");
      router.push("/admin/dashboard");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Edit Blackspot</h1>
        <p className="text-blue-600">Update road safety monitoring point</p>
      </div>
      <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-100">
        <form onSubmit={e => { e.preventDefault(); saveBlackspot(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Blackspot Name</label>
              <input type="text" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Main Street Junction" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Reason</label>
              <input type="text" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Frequent accidents" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Latitude</label>
              <input type="number" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="e.g., 19.123456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Longitude</label>
              <input type="number" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="e.g., 72.987654" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Radius (meters)</label>
              <input type="number" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={radius} onChange={e => setRadius(e.target.value)} placeholder="e.g., 100" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
