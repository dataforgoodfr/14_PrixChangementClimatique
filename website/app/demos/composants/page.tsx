import { Suspense } from "react";
import { ComponentExample } from "@/components/component-example";

export default function Page() {
  return (
    <Suspense>
      <ComponentExample />
    </Suspense>
  );
}
