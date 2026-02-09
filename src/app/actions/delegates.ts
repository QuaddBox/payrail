"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export interface Delegate {
  id: string;
  organization_id: string;
  wallet_address: string;
  label?: string;
  created_at: string;
}

/**
 * Get all delegates for the current user's organization
 */
export async function getDelegates() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("delegates")
    .select("*")
    .eq("organization_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // Table might not exist yet, return empty array
    console.error("Error fetching delegates:", error);
    return { data: [] };
  }

  return { data: data || [] };
}

/**
 * Add a new delegate to the organization
 */
export async function addDelegate(walletAddress: string, label?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate wallet address format
  if (!walletAddress.startsWith("ST") && !walletAddress.startsWith("SP")) {
    return { error: "Invalid Stacks wallet address format" };
  }

  // Check if delegate already exists
  const { data: existing } = await supabase
    .from("delegates")
    .select("id")
    .eq("organization_id", user.id)
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  if (existing) {
    return { error: "This wallet is already authorized as a delegate" };
  }

  const { error } = await supabase.from("delegates").insert([
    {
      organization_id: user.id,
      wallet_address: walletAddress,
      label: label || null,
    },
  ]);

  if (error) {
    console.error("Error adding delegate:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/wallet");
  return { success: true };
}

/**
 * Remove a delegate from the organization
 */
export async function removeDelegate(walletAddress: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("delegates")
    .delete()
    .eq("organization_id", user.id)
    .eq("wallet_address", walletAddress);

  if (error) {
    console.error("Error removing delegate:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/wallet");
  return { success: true };
}

/**
 * Update a delegate's label
 */
export async function updateDelegateLabel(
  walletAddress: string,
  label: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("delegates")
    .update({ label })
    .eq("organization_id", user.id)
    .eq("wallet_address", walletAddress);

  if (error) {
    console.error("Error updating delegate:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/wallet");
  return { success: true };
}
