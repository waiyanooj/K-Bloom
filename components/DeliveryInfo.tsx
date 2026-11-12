"use client";

import { useEffect, useState, type FormEvent } from "react";

const storageKey = "kbloom-delivery-info";
const empty = { name: "", phone: "", address: "" };

export default function DeliveryInfo() {
  const [details, setDetails] = useState(empty);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object" && "name" in saved && "phone" in saved && "address" in saved &&
          typeof saved.name === "string" && typeof saved.phone === "string" && typeof saved.address === "string") {
        setDetails({ name: saved.name, phone: saved.phone, address: saved.address });
      }
    } catch { /* The form remains usable if browser storage is unavailable. */ }
    setReady(true);
  }, []);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = { name: details.name.trim(), phone: details.phone.trim(), address: details.address.trim() };
    const invalid = !cleaned.name ? "name" : !/^[+\d\s()-]+$/.test(cleaned.phone) ||
      cleaned.phone.replace(/\D/g, "").length < 7 || cleaned.phone.replace(/\D/g, "").length > 15 ? "phone" : !cleaned.address ? "address" : null;
    if (invalid) {
      const field = event.currentTarget.elements.namedItem(invalid) as HTMLInputElement | HTMLTextAreaElement;
      field.setCustomValidity(invalid === "phone" ? "Enter a valid phone number with 7–15 digits." : "Please fill in this field.");
      field.reportValidity();
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(cleaned));
      setDetails(cleaned);
      setStatus("Delivery details saved in this browser. No order has been placed.");
    } catch {
      setStatus("We couldn't save your details in this browser. Your entries are still here; please try again.");
    }
  }

  function clear() {
    try {
      localStorage.removeItem(storageKey);
      setDetails(empty);
      setStatus("Your saved delivery details have been removed from this browser.");
    } catch {
      setStatus("We couldn't remove the saved details. Please try again or clear this site's browser data.");
    }
  }

  return (
    <div className="delivery-card">
      <p className="products-eyebrow">MADE PERSONAL</p>
      <h3 id="delivery-title">Where shall we deliver?</h3>
      <p className="delivery-intro">Keep your delivery details ready for your next fragrance selection.</p>
      <form aria-labelledby="delivery-title" onSubmit={save} onInput={(event) => {
        const field = event.target;
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.setCustomValidity("");
        setStatus("");
      }}>
        <fieldset disabled={!ready}>
          <div className="delivery-fields">
            <label htmlFor="delivery-name">Full name <span>Required</span>
              <input id="delivery-name" name="name" autoComplete="shipping name" required maxLength={100}
                placeholder="Your full name" value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} />
            </label>
            <label htmlFor="delivery-phone">Phone number <span>Required</span>
              <input id="delivery-phone" name="phone" type="tel" autoComplete="shipping tel" required maxLength={25}
                placeholder="09… or +95…" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} />
            </label>
            <label className="delivery-address" htmlFor="delivery-address">Delivery address <span>Required</span>
              <textarea id="delivery-address" name="address" autoComplete="shipping street-address" required rows={3} maxLength={600}
                placeholder="House / building, street, township and city" value={details.address}
                onChange={(event) => setDetails({ ...details, address: event.target.value })} />
            </label>
          </div>
          <p className="delivery-privacy" id="delivery-privacy">Saved only in this browser, not sent to the store. Saving these details does not place an order.</p>
          <div className="delivery-actions">
            <button type="submit" className="delivery-save" aria-describedby="delivery-privacy">Save delivery details <span aria-hidden="true">↗</span></button>
            <button type="button" className="delivery-clear" onClick={clear}>Clear details</button>
          </div>
        </fieldset>
        <p className="delivery-status" role="status" aria-live="polite">{status}</p>
      </form>
    </div>
  );
}
