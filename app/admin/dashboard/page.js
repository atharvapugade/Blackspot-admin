"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const router = useRouter();
  const [blackspots, setBlackspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminEmail = localStorage.getItem("adminEmail");
    const adminPass = localStorage.getItem("adminPass");

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
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Blackspots Dashboard</h1>
        <p className="text-blue-600">Monitor and manage all road safety blackspots</p>
      </div>

      {blackspots.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">No Blackspots Found</h3>
          <p className="text-blue-600 mb-6">Start by adding your first road safety monitoring point.</p>
          <button
            onClick={() => router.push("/admin/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Add First Blackspot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blackspots.map((blackspot) => (
            <div key={blackspot.id} className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-blue-800 mb-2">{blackspot.name}</h3>
                <p className="text-blue-600 text-sm mb-3">{blackspot.reason}</p>
                <div className="text-xs text-blue-500">
                  <div>Lat: {blackspot.latitude}</div>
                  <div>Lng: {blackspot.longitude}</div>
                  <div>Radius: {blackspot.radius}m</div>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/blackspot/${blackspot.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View More
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}