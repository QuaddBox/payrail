"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Shield,
  Info,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStacks } from "@/hooks/useStacks";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase";
import {
  getDelegates,
  addDelegate,
  removeDelegate,
  type Delegate,
} from "@/app/actions/delegates";

const WalletConnect = dynamic(
  () => import("@/components/WalletConnect").then((mod) => mod.WalletConnect),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 animate-pulse bg-accent/20 rounded-xl" />
    ),
  },
);

export function WalletClient() {
  const { user } = useAuth();
  const {
    address: connectedAddress,
    isConnected,
    authorizeDelegate,
    revokeDelegate,
    checkIsAuthorized,
    getBusinessInfo,
    isTestnet,
  } = useStacks();

  const supabase = React.useMemo(() => createClient(), []);

  const [ownerWallet, setOwnerWallet] = React.useState<string | null>(null);
  const [isOwner, setIsOwner] = React.useState(false);
  const [isAuthorizedDelegate, setIsAuthorizedDelegate] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(false);
  const [isAuthorizing, setIsAuthorizing] = React.useState(false);
  const [hasOrganization, setHasOrganization] = React.useState(false);

  // State for owner to authorize/revoke delegates
  const [delegateAddress, setDelegateAddress] = React.useState("");
  const [authorizationSuccess, setAuthorizationSuccess] = React.useState(false);
  const [revokeAddress, setRevokeAddress] = React.useState("");
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [revokeSuccess, setRevokeSuccess] = React.useState(false);

  // Delegate list from database
  const [delegates, setDelegates] = React.useState<Delegate[]>([]);
  const [isLoadingDelegates, setIsLoadingDelegates] = React.useState(false);

  // Fetch the stored organization owner wallet from profile
  React.useEffect(() => {
    async function fetchOwnerWallet() {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_address")
          .eq("id", user.id)
          .single();

        setOwnerWallet(profile?.wallet_address || null);
      }
    }
    fetchOwnerWallet();
  }, [user, supabase]);

  // Check authorization status when wallet or owner changes
  React.useEffect(() => {
    async function checkAuth() {
      if (!connectedAddress || !ownerWallet) {
        setIsOwner(false);
        setIsAuthorizedDelegate(false);
        return;
      }

      setIsCheckingAuth(true);

      // Check if connected wallet is the owner
      if (connectedAddress.toLowerCase() === ownerWallet.toLowerCase()) {
        setIsOwner(true);
        setIsAuthorizedDelegate(false);

        // Also check if owner has an organization
        const businessInfo = await getBusinessInfo(connectedAddress);
        setHasOrganization(businessInfo.hasOrg || false);
      } else {
        setIsOwner(false);
        // Check if connected wallet is an authorized delegate
        const authorized = await checkIsAuthorized(
          ownerWallet,
          connectedAddress,
        );
        setIsAuthorizedDelegate(authorized);

        // Check if owner has an organization
        const businessInfo = await getBusinessInfo(ownerWallet);
        setHasOrganization(businessInfo.hasOrg || false);
      }

      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [connectedAddress, ownerWallet, checkIsAuthorized, getBusinessInfo]);

  const handleAuthorizeWallet = async () => {
    if (!connectedAddress || !ownerWallet) return;

    setIsAuthorizing(true);
    try {
      // The owner needs to sign this transaction
      // This will open the wallet popup for the owner to authorize the delegate
      await authorizeDelegate(connectedAddress, () => {
        // After successful authorization, recheck status
        setIsAuthorizedDelegate(true);
      });
    } catch (e) {
      console.error("Authorization failed:", e);
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Fetch delegates from database when owner is connected
  const fetchDelegates = React.useCallback(async () => {
    if (!isOwner) return;
    setIsLoadingDelegates(true);
    try {
      const result = await getDelegates();
      if (result.data) {
        setDelegates(result.data);
      }
    } catch (e) {
      console.error("Failed to fetch delegates:", e);
    } finally {
      setIsLoadingDelegates(false);
    }
  }, [isOwner]);

  React.useEffect(() => {
    if (isOwner) {
      fetchDelegates();
    }
  }, [isOwner, fetchDelegates]);

  // Handler for owner to authorize a new delegate by address
  const handleAuthorizeDelegateByAddress = async () => {
    if (!delegateAddress || !isOwner) return;

    // Validate address format (basic check for Stacks address)
    if (
      !delegateAddress.startsWith("ST") &&
      !delegateAddress.startsWith("SP")
    ) {
      return;
    }

    setIsAuthorizing(true);
    setAuthorizationSuccess(false);
    try {
      const addressToAuthorize = delegateAddress;
      await authorizeDelegate(addressToAuthorize, async () => {
        // Save to database after successful on-chain authorization
        await addDelegate(addressToAuthorize);
        setAuthorizationSuccess(true);
        setDelegateAddress("");
        // Refresh delegate list
        fetchDelegates();
      });
    } catch (e) {
      console.error("Authorization failed:", e);
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Handler for owner to revoke a delegate's authorization
  const handleRevokeDelegateByAddress = async (addressToRevoke?: string) => {
    const targetAddress = addressToRevoke || revokeAddress;
    if (!targetAddress || !isOwner) return;

    // Validate address format
    if (!targetAddress.startsWith("ST") && !targetAddress.startsWith("SP")) {
      return;
    }

    setIsRevoking(true);
    setRevokeSuccess(false);
    try {
      await revokeDelegate(targetAddress, async () => {
        // Remove from database after successful on-chain revocation
        await removeDelegate(targetAddress);
        setRevokeSuccess(true);
        setRevokeAddress("");
        // Refresh delegate list
        fetchDelegates();
      });
    } catch (e) {
      console.error("Revocation failed:", e);
    } finally {
      setIsRevoking(false);
    }
  };

  // Determine wallet status
  const getWalletStatus = () => {
    if (isCheckingAuth) {
      return {
        type: "loading",
        text: "Checking authorization...",
        color: "text-muted-foreground",
      };
    }
    if (!isConnected) {
      return {
        type: "disconnected",
        text: "No wallet connected",
        color: "text-muted-foreground",
      };
    }
    if (isOwner) {
      return {
        type: "owner",
        text: "Organization Owner",
        color: "text-green-600",
      };
    }
    if (isAuthorizedDelegate) {
      return {
        type: "delegate",
        text: "Authorized Delegate",
        color: "text-blue-600",
      };
    }
    if (ownerWallet && connectedAddress !== ownerWallet) {
      return {
        type: "unauthorized",
        text: "Not Authorized",
        color: "text-yellow-600",
      };
    }
    return { type: "connected", text: "Connected", color: "text-green-600" };
  };

  const walletStatus = getWalletStatus();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your Stacks wallet connection and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Connected Wallet</CardTitle>
              <CardDescription>
                Your wallet is used to sign transactions and receive STX.
                Payrail never stores your private keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>

          {/* Authorization Status Card */}
          {isConnected && ownerWallet && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Transaction Authorization
                  {walletStatus.type === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </CardTitle>
                <CardDescription>
                  Your authorization status for executing payroll transactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    walletStatus.type === "owner" ||
                    walletStatus.type === "delegate"
                      ? "bg-green-50 dark:bg-green-950/20"
                      : walletStatus.type === "unauthorized"
                        ? "bg-yellow-50 dark:bg-yellow-950/20"
                        : "bg-accent/20"
                  }`}
                >
                  {walletStatus.type === "owner" ||
                  walletStatus.type === "delegate" ? (
                    <CheckCircle2 className={`h-6 w-6 ${walletStatus.color}`} />
                  ) : walletStatus.type === "unauthorized" ? (
                    <AlertCircle className={`h-6 w-6 ${walletStatus.color}`} />
                  ) : (
                    <Info className={`h-6 w-6 ${walletStatus.color}`} />
                  )}
                  <div>
                    <p className={`font-bold ${walletStatus.color}`}>
                      {walletStatus.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {walletStatus.type === "owner" &&
                        "You own this organization and can execute payroll."}
                      {walletStatus.type === "delegate" &&
                        "You are authorized to execute payroll on behalf of the organization."}
                      {walletStatus.type === "unauthorized" &&
                        "This wallet is not authorized to execute payroll."}
                    </p>
                  </div>
                </div>

                {/* Show authorize button for unauthorized wallets when owner is viewing */}
                {walletStatus.type === "unauthorized" && hasOrganization && (
                  <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                    <p className="text-sm text-muted-foreground mb-3">
                      To authorize this wallet for payroll transactions, the{" "}
                      <strong>organization owner</strong> must sign the
                      authorization.
                    </p>
                    <Button
                      onClick={handleAuthorizeWallet}
                      disabled={isAuthorizing}
                      className="w-full rounded-xl"
                    >
                      {isAuthorizing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Authorizing...
                        </>
                      ) : (
                        "Authorize This Wallet"
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      The owner wallet ({ownerWallet.slice(0, 8)}...
                      {ownerWallet.slice(-4)}) must sign this transaction.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manage Delegates Card - Only for owners */}
          {isConnected && isOwner && hasOrganization && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Manage Delegates
                </CardTitle>
                <CardDescription>
                  Authorize other wallets to execute payroll on your behalf.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Delegate wallet address (ST...)"
                      value={delegateAddress}
                      onChange={(e) => setDelegateAddress(e.target.value)}
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      onClick={handleAuthorizeDelegateByAddress}
                      disabled={
                        isAuthorizing ||
                        !delegateAddress ||
                        (!delegateAddress.startsWith("ST") &&
                          !delegateAddress.startsWith("SP"))
                      }
                      className="rounded-xl px-6"
                    >
                      {isAuthorizing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Authorize"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the Stacks wallet address you want to authorize. The
                    delegate will be able to execute payroll transactions on
                    behalf of your organization.
                  </p>
                </div>

                {authorizationSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Authorization transaction submitted! It may take a few
                      minutes to confirm on-chain.
                    </span>
                  </div>
                )}

                {/* Delegate List */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Authorized Delegates</p>
                    {isLoadingDelegates && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {delegates.length > 0 ? (
                    <div className="space-y-2">
                      {delegates.map((delegate) => (
                        <div
                          key={delegate.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono truncate">
                              {delegate.wallet_address}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Added{" "}
                              {new Date(
                                delegate.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleRevokeDelegateByAddress(
                                delegate.wallet_address,
                              )
                            }
                            disabled={isRevoking}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No delegates authorized yet. Add one above.
                    </p>
                  )}
                </div>

                {/* Revoke Section */}
                <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-medium text-destructive">
                    Revoke Delegate Access
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Delegate address to revoke (ST...)"
                      value={revokeAddress}
                      onChange={(e) => setRevokeAddress(e.target.value)}
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      onClick={() => handleRevokeDelegateByAddress()}
                      disabled={
                        isRevoking ||
                        !revokeAddress ||
                        (!revokeAddress.startsWith("ST") &&
                          !revokeAddress.startsWith("SP"))
                      }
                      variant="destructive"
                      className="rounded-xl px-6"
                    >
                      {isRevoking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the wallet address you want to remove from authorized
                    delegates.
                  </p>
                </div>

                {revokeSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Revocation transaction submitted! The delegate will lose
                      access once confirmed.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>
                Standard security protocols for non-custodial apps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                <Shield className="h-6 w-6 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Encryption Protocol</p>
                  <p className="opacity-80">
                    All interactions between Payrail and your wallet are
                    encrypted locally in your browser.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300">
                <Info className="h-6 w-6 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Transaction Signing</p>
                  <p className="opacity-80">
                    Every STX transfer requires your manual approval in the
                    wallet extension. Payrail cannot move funds without you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Network Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-bold text-primary italic uppercase tracking-widest text-xs">
                  {isTestnet ? "Testnet" : "Mainnet"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-muted-foreground">API Status</span>
                <span className="flex items-center gap-1.5 text-green-600 font-bold">
                  <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Online
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                asChild
              >
                <a
                  href={`https://explorer.hiro.so/?chain=${isTestnet ? "testnet" : "mainnet"}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Explorer
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <h4 className="font-bold text-sm mb-2">Need a Wallet?</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              We recommend Leather or Hiro Wallet for the best experience on
              Stacks.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              asChild
            >
              <a
                href="https://leather.io/install"
                target="_blank"
                rel="noreferrer"
              >
                Install Leather
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
