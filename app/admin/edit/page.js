import EditBlackspot from "./EditBlackspot";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditBlackspot />
    </Suspense>
  );
}