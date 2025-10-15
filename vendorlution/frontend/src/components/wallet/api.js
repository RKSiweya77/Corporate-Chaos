// src/components/wallet/api.js
import api from "../../api/axios";

/**
 * Centralize wallet endpoints so you only change URLs here if needed.
 * Expected backend endpoints:
 *   GET    /api/wallet/me/             -> wallet info {id, user, balance, currency}
 *   GET    /api/wallet/ledger/         -> [{id, type, amount, balance_after, description, reference, created_at}]
 *   POST   /api/wallet/deposit/        body: { amount, provider: "ozow" } -> {redirect_url, intent_id}
 *   POST   /api/wallet/payouts/request/ body: { amount, bank_ref } -> {id, status, amount}
 */

export async function getMyWallet() {
  const { data } = await api.get("/wallet/me/");
  return data;
}

export async function getLedger() {
  const { data } = await api.get("/wallet/ledger/");
  // support both array and paginated
  return Array.isArray(data) ? data : data?.results || [];
}

export async function createOzowDeposit(amount) {
  const { data } = await api.post("/wallet/deposit/", {
    amount,
    provider: "ozow",
  });
  return data; // {redirect_url, intent_id}
}

export async function requestPayout(amount, bankRef) {
  const { data } = await api.post("/wallet/payouts/request/", {
    amount,
    bank_ref: bankRef,
  });
  return data;
}
