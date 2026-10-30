"use client";

import { useEffect, useState } from "react";

function readCartCount(): number {
    try{
        const cart: unknown = JSON.parse(localStorage.getItem("kbloom-cart") || "{}");

        if(!cart || typeof cart != "object" || Array.isArray(cart)) return 0;

        return Object.values(cart).reduce<number>((total, value) => {
            if(typeof value != "number" && typeof value != "string") return total;

            const quantity = Number(value);

            return Number.isSafeInteger(quantity) && quantity > 0 ? total + quantity : total;
        },0)
    }catch{
        return 0;
    }
}

export default function CartCount(){
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(readCartCount());

        function handleCartUpdate(event: Event) {
            setCount((event as CustomEvent<number>).detail);
        }

        function handleStorage(event: StorageEvent){
            if(event.key === "kbloom-cart" || event.key === null){
                setCount(readCartCount());
            }
        }

        window.addEventListener("cart-updated", handleCartUpdate);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("cart-updated", handleCartUpdate);
            window.removeEventListener("storage", handleStorage);
        }
    },[]);

    return(
        <span className="cart-count" role="status" aria-live="polite">
            <span aria-hidden="true">{count}</span>
            <span className="cart-count-label">{count} item in cart</span>
        </span>
    )
}