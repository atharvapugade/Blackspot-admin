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

    if (id !== null) {
      load();
    } else {
      setLoading(false);
    }
  }, [id, router, adminEmail, adminPass]);

  const updateBlackspot = async () => {
    if (!id) {
      alert("No blackspot ID provided");
      return;
    }

    if (!adminEmail || !adminPass) {
      alert("Admin authentication required");
      router.push("/admin/login");
      return;
    }

    if (!name || !reason || !latitude || !longitude || !radius) {
      alert("Fill all fields");
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

      alert("Updated Successfully");
      router.push("/admin/dashboard");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-blue-600">No blackspot ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">Edit Blackspot</h1>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter blackspot name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Reason</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for blackspot"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Enter latitude"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Enter longitude"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Radius (meters)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="Enter radius in meters"
            />
          </div>

          <button
            onClick={updateBlackspot}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Blackspot
          </button>
        </div>
      </div>
    </div>
  );
}