import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";

// normalize list payloads: array OR {results:[...]}
function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}
function toMedia(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const base = api.defaults.baseURL || "/api";
    const origin = base.startsWith("http") ? new URL(base).origin : window.location.origin;
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export default function ChatWindow() {
  const [search] = useSearchParams();
  const vendorParam = search.get("vendor");
  const productParam = search.get("product");
  const conversationParam = search.get("conversation");

  const vendorId = vendorParam ? Number(vendorParam) : null;
  const productId = productParam ? Number(productParam) : null;

  const [conversationId, setConversationId] = useState(conversationParam ? Number(conversationParam) : null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const pollRef = useRef(null);
  const listEndRef = useRef(null);

  const scrollToEnd = () => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load referenced product (to show a chip with image/title)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!productId) return;
      try {
        const res = await api.get(`/products/${productId}/`);
        if (!alive) return;
        setProduct(res.data);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [productId]);

  // Ensure conversation: use query (?conversation=ID) OR (?vendor=ID) and create if missing
  const ensureConversation = useCallback(async () => {
    // If conversation id was explicitly provided in the URL, trust it
    if (conversationParam) {
      const id = Number(conversationParam);
      setConversationId(id);
      return id;
    }
    // Otherwise, resolve by vendor
    if (!vendorId) return null;

    // 1) list my convos
    const all = await api.get("/me/conversations/");
    const items = toList(all.data);
    // Conversations in your serializer are primitive ids for buyer/vendor
    let conv = items.find((c) => c.vendor === vendorId);

    // If not found, create
    if (!conv) {
      const created = await api.post("/me/conversations/", { vendor_id: vendorId });
      conv = created.data;
    }

    setConversationId(conv.id);
    return conv.id;
  }, [vendorId, conversationParam]);

  // Load vendor profile for header (if we only have vendor id)
  const loadVendor = useCallback(async (vId) => {
    if (!vId) return;
    try {
      const res = await api.get(`/vendors/${vId}/`);
      setVendor(res.data);
    } catch {}
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (convId) => {
      if (!convId) return;
      try {
        const res = await api.get(`/me/messages/?conversation_id=${convId}`);
        const list = toList(res.data);
        setMessages(list);
        // attempt to load vendor if missing (from first message's convo if present)
        if (!vendor && list.length) {
          // we don't have nested convo fields in each message; rely on url param vendorId
          if (vendorId) loadVendor(vendorId);
        }
        // scroll to bottom
        setTimeout(scrollToEnd, 50);
      } catch (e) {
        // auth guard
        if (e?.response?.status === 401) {
          window.location.href = "/customer/login?next=" + encodeURIComponent(window.location.href);
        }
      }
    },
    [vendor, vendorId, loadVendor]
  );

  // Initial bootstrap: ensure conversation, load vendor/product, then messages
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const id = await ensureConversation();
        if (!alive) return;
        if (vendorId) loadVendor(vendorId);
        if (id) await loadMessages(id);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ensureConversation, loadMessages, loadVendor, vendorId]);

  // Poll every 6s
  useEffect(() => {
    if (!conversationId) return;
    pollRef.current = setInterval(() => loadMessages(conversationId), 6000);
    return () => clearInterval(pollRef.current);
  }, [conversationId, loadMessages]);

  const onSend = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !conversationId) return;
    try {
      setSending(true);
      await api.post("/me/messages/", {
        conversation: conversationId,
        text: body,
      });
      setText("");
      await loadMessages(conversationId);
    } catch (err) {
      if (err?.response?.status === 401) {
        window.location.href = "/customer/login?next=" + encodeURIComponent(window.location.href);
      } else {
        alert("Failed to send message");
      }
    } finally {
      setSending(false);
    }
  };

  const vendorName = useMemo(() => {
    return (
      vendor?.shop_name ||
      vendor?.owner?.username ||
      vendor?.user?.username ||
      (vendorId ? `Vendor #${vendorId}` : "Chat")
    );
  }, [vendor, vendorId]);

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            <i className="fa fa-store"></i>
          </div>
          <div>
            <div className="fw-semibold">{vendorName}</div>
            {vendor?.rating_avg ? (
              <div className="small text-muted">★ {Number(vendor.rating_avg).toFixed(1)}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Product reference chip (if came from a product) */}
      {product && (
        <div className="card mb-3">
          <div className="card-body d-flex align-items-center gap-3">
            <img
              src={toMedia(product.main_image)}
              alt={product.title}
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
            />
            <div className="flex-grow-1">
              <div className="fw-semibold">{product.title}</div>
              <div className="text-muted small">Ref: Product #{product.id}</div>
            </div>
            <a className="btn btn-outline-secondary btn-sm" href={`/product/${product.slug ?? product.id}/${product.id}`}>
              View
            </a>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="card">
        <div className="card-body" style={{ height: 420, overflowY: "auto" }}>
          {loading ? (
            <div className="text-center text-muted">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted">Say hi 👋</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`d-flex ${m.is_me ? "justify-content-end" : "justify-content-start"} mb-2`}>
                <div
                  className={`px-3 py-2 rounded-3 ${m.is_me ? "bg-dark text-white" : "bg-light"}`}
                  style={{ maxWidth: "75%" }}
                >
                  <div className="small" style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  <div className="text-muted small mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={listEndRef} />
        </div>

        {/* Composer */}
        <form className="card-footer d-flex gap-2" onSubmit={onSend}>
          <input
            className="form-control"
            placeholder={product ? `Ask about “${product.title}”...` : "Type a message..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-dark" disabled={!conversationId || sending || !text.trim()}>
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
