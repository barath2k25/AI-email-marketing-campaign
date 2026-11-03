"use client";
import { useEffect, useState } from "react";
import type { Contact } from "@/types";
import ContactsClient from "./ContactsClient";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contacts").then((r) => r.json()).then(setContacts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading…</div>;

  const stats = {
    total: contacts.length,
    subscribed: contacts.filter((c) => c.status === "subscribed").length,
    unsubscribed: contacts.filter((c) => c.status === "unsubscribed").length,
    bounced: contacts.filter((c) => c.status === "bounced").length,
  };

  return <ContactsClient contacts={contacts} stats={stats} />;
}
