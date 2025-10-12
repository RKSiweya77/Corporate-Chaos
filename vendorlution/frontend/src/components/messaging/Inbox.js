import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Inbox(){
  const BUYER_ID = localStorage.getItem("customer_id") || "1";
  const [convos, setConvos] = useState([]); const [active, setActive] = useState(null); const [messages, setMessages] = useState([]); const [text, setText] = useState("");
  useEffect(()=>{ api.get(`/conversations/?buyer_id=${BUYER_ID}`).then(res=>setConvos(Array.isArray(res.data)?res.data:(res.data?.results||[]))); }, [BUYER_ID]);
  useEffect(()=>{ if(!active) return; api.get(`/messages/?conversation_id=${active.id}`).then(res=>setMessages(Array.isArray(res.data)?res.data:(res.data?.results||[]))); }, [active]);
  const send = (e)=>{ e.preventDefault(); if(!text.trim()||!active) return; api.post("/messages/", { conversation: active.id, sender: 1, text }).then(()=>{
    setText(""); return api.get(`/messages/?conversation_id=${active.id}`);
  }).then(res=>setMessages(Array.isArray(res.data)?res.data:(res.data?.results||[]))); };
  return (
    <div className="container py-4">
      <h3 className="mb-3">Messages</h3>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="list-group">
            {convos.map(c=>(<button key={c.id} className={`list-group-item list-group-item-action ${active?.id===c.id ? "active":""}`} onClick={()=>setActive(c)}>Conversation #{c.id} • Vendor {c.vendor}</button>))}
            {convos.length===0 && <div className="text-muted p-3">No conversations.</div>}
          </div>
        </div>
        <div className="col-md-8">
          {!active ? <div className="text-muted">Select a conversation</div> : (
            <div className="card border-0 shadow-sm">
              <div className="card-body" style={{height:320, overflowY:"auto"}}>
                {messages.map(m=>(<div key={m.id} className="mb-2"><div className="small text-muted">{new Date(m.created_at).toLocaleString()}</div><div>{m.text}</div></div>))}
                {messages.length===0 && <div className="text-muted">No messages.</div>}
              </div>
              <div className="card-footer bg-white">
                <form onSubmit={send} className="d-flex gap-2">
                  <input className="form-control" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." />
                  <button className="btn btn-dark" type="submit">Send</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
