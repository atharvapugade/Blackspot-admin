"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddAdminPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddAdmin = async (event) => {
        event.preventDefault();

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password.trim();

        if (!email || !password) {
            alert("Email and password are required");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/create-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to create admin");
            }

            alert("Admin added successfully");
            router.push("/admin/admins");
        } catch (error) {
            alert(`Failed to add admin: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-blue-800">Add New Admin</h1>
                    <button
                        onClick={() => router.push("/admin/admins")}
                        className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Back to Admins
                    </button>
                </div>

                <form onSubmit={handleAddAdmin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Name (Optional)</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter name"
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                        {isSubmitting ? "Adding..." : "Add Admin"}
                    </button>
                </form>
            </div>
        </div>
    );
}
