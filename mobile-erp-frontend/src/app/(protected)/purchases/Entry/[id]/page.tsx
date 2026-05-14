"use client";

import { use } from "react";
import PurchaseEntryForm from "../PurchaseEntryForm";

export default function EditPurchaseEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PurchaseEntryForm id={id} />;
}
