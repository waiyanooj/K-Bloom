"use client";

import { useEffect, useState } from "react";

import { readCart } from "../lib/cart";

function readCartCount(): number {
    return Object.values(readCart()).reduce((sum, quantity) => sum + quantity, 0);
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