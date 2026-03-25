"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddBlackspot() {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const router = useRouter();

  const adminEmail = localStorage.getItem("adminEmail");
  const adminPass = localStorage.getItem("adminPass");

  const saveBlackspot = async () => {
    if (!name || !reason || !latitude || !longitude || !radius) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "blackspots"), {
        name,
        reason,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        adminEmail,
        adminPass,
      });

      alert("Blackspot Added!");
      router.push("/admin/dashboard");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Add New Blackspot</h1>
        <p className="text-blue-600">Create a new road safety monitoring point</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-100">
        <form onSubmit={(e) => { e.preventDefault(); saveBlackspot(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Blackspot Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Main Street Junction"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Reason for Blackspot
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., High accident rate"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 40.7128"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., -74.0060"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Radius (meters)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 100"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
            >
              <span>💾</span>
              <span>Save Blackspot</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}