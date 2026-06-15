import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ClipboardList, LogOut, Shield, Users, Building2, History, Plus, Save, Trash2, Package, Upload, BadgePercent, Users2, FileText, AlertCircle, PackageX, Activity, Wallet, TrendingUp, Download, Bell, Eye, EyeOff, Smartphone, Monitor, Laptop, Server, Headphones, HardDrive, Cpu, Printer, Mouse, Keyboard } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const roles = ["SUPER_ADMIN", "ADMIN", "USER"];
const roleLabels = { SUPER_ADMIN: "CEO", ADMIN: "Branch Manager", USER: "GRO" };
const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statuses = ["ACTIVE", "IN_PROGRESS", "COMPLETED"];

function getInitials(name) {
  if (!name || name === "N/A" || name === "Unassigned") return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function api(path, options = {}) {
  const session = JSON.parse(localStorage.getItem("crms-session") || "null");
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {})
    }
  }).then(async (response) => {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("crms-session");
        window.location.reload();
      }
      const text = await response.text();
      throw new Error(text || response.statusText);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  });
}

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("crms-session") || "null"));

  function onLogin(nextSession) {
    localStorage.setItem("crms-session", JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function logout() {
    localStorage.removeItem("crms-session");
    setSession(null);
  }

  return session ? <Shell session={session} logout={logout} /> : <Login onLogin={onLogin} />;
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "superadmin@example.com", password: "Admin@123" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKeyUpDown = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  };

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      onLogin(await api("/auth/login", { method: "POST", body: JSON.stringify(form) }));
    } catch (err) {
      setError("Login failed. Check credentials and API availability.");
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand-mark"><ClipboardList size={34} /></div>
        <h1>VIJAYAM ENTERPRISES</h1>
        <form onSubmit={submit}>
          <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>
            Password
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                onKeyDown={handleKeyUpDown}
                onKeyUp={handleKeyUpDown}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "8px", background: "transparent", border: "none", color: "#64748b", padding: "4px", cursor: "pointer", display: "flex", minHeight: "auto" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {capsLock && <p style={{ color: "#ea580c", fontSize: "12px", margin: "0", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={14}/> Caps Lock is ON</p>}
          {error && <p className="error">{error}</p>}
          <button className="primary">Login</button>
        </form>
      </section>
    </main>
  );
}

function Shell({ session, logout }) {
  const getInitialTab = () => {
    const path = window.location.pathname.replace(/^\//, '');
    const validTabs = ["dashboard", "customers", "requirements", "inventory", "collections", "reports", "users", "audits"];
    return validTabs.includes(path) ? path : "dashboard";
  };
  const [tab, setTabState] = useState(getInitialTab());

  const setTab = (id) => {
    setTabState(id);
    window.history.pushState({}, "", `/${id}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      setTabState(getInitialTab());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => api("/notifications").then(setNotifications).catch(() => {});
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 10000);
    return () => clearInterval(iv);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    await api(`/notifications/${id}/read`, { method: "PUT" }).catch(() => {});
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const nav = [
    ["dashboard", ClipboardList, "Dashboard"],
    ["customers", Building2, "Customers"],
    ["requirements", ClipboardList, "Requirements"],
    ...(session.role !== "USER" ? [["inventory", Package, "Inventory"]] : []),
    ["collections", BadgePercent, "Collections"],
    ["reports", FileText, "Reports"],
    ...(session.role !== "USER" ? [["users", Users, "Roles"]] : []),
    ...(session.role !== "USER" ? [["audits", History, "Audit Trail"]] : [])
  ];

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-brand"><Shield /> <span>VIJAYAM ENTERPRISES</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {nav.map(([id, Icon, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)} title={label}>
            <Icon size={18} /> {label}
          </button>
        ))}
        </div>
        <button className="logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </nav>
      <main className="workspace">
        <header>
          <div>
            <p className="eyebrow">{session.role.replace("_", " ")}</p>
            <h1>{titleFor(tab)}</h1>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative", color: "var(--text-main)" }}>
                <Bell size={24} />
                {unreadCount > 0 && <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" }}>{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div style={{ position: "absolute", top: "100%", right: 0, width: "300px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", zIndex: 50, maxHeight: "400px", overflowY: "auto" }}>
                  <div style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "bold" }}>Notifications</div>
                  {notifications.length === 0 ? <div style={{ padding: "12px", color: "#64748b", fontSize: "13px", textAlign: "center" }}>No notifications</div> : null}
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: n.read ? "white" : "#f0fdf4" }}>
                      <p style={{ margin: 0, fontSize: "13px", color: n.read ? "#475569" : "#0f172a", fontWeight: n.read ? "normal" : "bold" }}>{n.message}</p>
                      <small style={{ color: "#94a3b8", fontSize: "11px" }}>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="profile">{session.name}<span>{session.email}</span></div>
          </div>
        </header>
        {tab === "dashboard" && <Dashboard setTab={setTab} session={session} />}
        {tab === "customers" && <Customers canEdit={true} session={session} />}
        {tab === "requirements" && <Requirements canDelete={session.role !== "USER"} session={session} />}
        {tab === "inventory" && session.role !== "USER" && <Inventory canUpload={session.role !== "USER"} />}
        {tab === "collections" && <Collections canEdit={true} session={session} />}
        {tab === "reports" && <Reports session={session} />}
        {tab === "users" && session.role !== "USER" && <UsersPage session={session} />}
        {tab === "audits" && <AuditTrail session={session} />}
      </main>
    </div>
  );
}

function titleFor(tab) {
  return { dashboard: "Operational Dashboard", customers: "Customer Management", requirements: "Requirement Management", inventory: "Inventory Management", collections: "Coupon & Collection Management", reports: "Financial Reports", users: "Role Management", audits: "Audit Trail" }[tab];
}

function applyVisibility(data, type, session, assignableUsers = []) {
  if (!Array.isArray(data)) return [];
  if (!session || session.role === "SUPER_ADMIN") return data;

  const assignedUserEmails = assignableUsers.filter(u => u.assignedAdminName === session.name).map(u => u.email);

  return data.filter(item => {
    if (item.modifiedBy === session.email || item.actorEmail === session.email || item.userEmail === session.email) return true;
    if (assignedUserEmails.includes(item.modifiedBy) || assignedUserEmails.includes(item.actorEmail) || assignedUserEmails.includes(item.userEmail)) return true;
    
    // Explicit assignment checks
    if (type === "requirements") {
      if (item.assignedUser?.email === session.email || item.customer?.assignedUser?.email === session.email) return true;
      if (assignedUserEmails.includes(item.assignedUser?.email) || assignedUserEmails.includes(item.customer?.assignedUser?.email)) return true;
    }

    if (type === "collections" && (item.collectedByEmail === session.email || item.collectorAssignedAdminEmail === session.email)) return true;

    if (session.role === "ADMIN") {
      if (type === "customers" && item.assignedUserName === session.name) return true;
      if (type === "requirements" && (item.customer?.assignedUser?.name === session.name || item.assignedUser?.name === session.name)) return true;
      if (type === "collections" && item.collectedByName === session.name) return true;
    }
    return false;
  });
}

function Dashboard({ setTab, session }) {
  const [data, setData] = useState({ customers: [], requirements: [], inventory: [], collections: [], audits: [] });
  useEffect(() => {
    Promise.allSettled([api("/customers"), api("/requirements"), api("/inventory"), api("/collections"), api("/audits"), session.role === "ADMIN" ? api("/users").catch(() => []) : Promise.resolve([])]).then(([customers, requirements, inventory, collections, audits, users]) => {
      const u = users.value || [];
      setData({
        customers: applyVisibility(customers.value, "customers", session, u),
        requirements: applyVisibility(requirements.value, "requirements", session, u),
        inventory: Array.isArray(inventory.value) ? inventory.value : [],
        collections: applyVisibility(collections.value, "collections", session, u),
        audits: applyVisibility(audits.value, "audits", session, u)
      });
    });
  }, [session]);

  const activeReq = data.requirements.filter(r => r.status === "ACTIVE").length;
  const inProgressReq = data.requirements.filter(r => r.status === "IN_PROGRESS").length;
  const completedReq = data.requirements.filter(r => r.status === "COMPLETED").length;
  const totalReq = data.requirements.length;

  const withGro = data.collections.filter(c => !c.paymentVerified && c.paymentMode === "CASH").reduce((sum, c) => sum + (Number(c.collectedAmount) || 0), 0);
  const withAdmin = data.collections.filter(c => !c.paymentVerified && c.paymentMode !== "CASH").reduce((sum, c) => sum + (Number(c.collectedAmount) || 0), 0);
  const depositedAmount = data.collections.filter(c => c.paymentVerified).reduce((sum, c) => sum + (Number(c.collectedAmount) || 0), 0);

  const formatCurrency = (val) => `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderPieChart = () => {
    if (totalReq === 0) return <div style={{width:160, height:160, borderRadius:"50%", background:"#e2e8f0"}}></div>;
    const slices = [
      { value: activeReq, color: "#3b82f6" },
      { value: inProgressReq, color: "#f59e0b" },
      { value: completedReq, color: "#22c55e" },
    ].filter(s => s.value > 0);
    
    let conicString = "";
    let currentAngle = 0;
    slices.forEach(s => {
      const angle = (s.value / totalReq) * 360;
      conicString += `${s.color} ${currentAngle}deg ${currentAngle + angle}deg, `;
      currentAngle += angle;
    });
    conicString = conicString.slice(0, -2);
    return <div style={{ width: 160, height: 160, borderRadius: "50%", background: `conic-gradient(${conicString})`, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}></div>;
  };

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="dashboard-header">
        <div>
          <h2>System Overview</h2>
          <p>Real-time metrics and operations status</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.3)" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", opacity: 0.9 }}>Deposited Amount</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{formatCurrency(depositedAmount)}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", opacity: 0.9 }}>Amount with GRO (Cash)</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{formatCurrency(withGro)}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", opacity: 0.9 }}>Amount with Admin (Bank Pending)</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{formatCurrency(withAdmin)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div className="dashboard-card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <h3>Total Customers ({data.customers.length})</h3>
            <Users2 size={20} color="#146c72" />
          </div>
          <div style={{ flex: 1, maxHeight: "250px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            {data.customers.length === 0 ? <div style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>No customers</div> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {data.customers.map(c => (
                  <li key={c.id} style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", color: "#1e293b" }}>{c.name}</span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{c.mobile}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="card-header" style={{ width: "100%", marginBottom: "16px" }}>
            <h3>Requirements ({totalReq})</h3>
            <FileText size={20} color="#146c72" />
          </div>
          <div style={{ display: "flex", width: "100%", justifyContent: "space-around", alignItems: "center", flex: 1 }}>
            {renderPieChart()}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 12, height: 12, background: "#3b82f6", borderRadius: "50%" }}></div>
                <span style={{ fontWeight: "bold" }}>Active: {activeReq}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 12, height: 12, background: "#f59e0b", borderRadius: "50%" }}></div>
                <span style={{ fontWeight: "bold" }}>In Progress: {inProgressReq}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 12, height: 12, background: "#22c55e", borderRadius: "50%" }}></div>
                <span style={{ fontWeight: "bold" }}>Completed: {completedReq}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: "1fr" }}>
        <div className="dashboard-card inventory-card" style={{ padding: "24px" }}>
          <div className="card-header">
            <h3>Inventory Overview</h3>
            <Package size={20} />
          </div>
          <div className="alert-stats" style={{ display: "flex", gap: "24px", marginTop: "16px" }}>
            <div className="alert-stat warning" style={{ flex: 1, padding: "20px", background: "#fef3c7", borderRadius: "12px", border: "1px solid #fde68a", display: "flex", gap: "16px", alignItems: "center" }}>
              <AlertCircle size={40} color="#d97706" />
              <div>
                <strong style={{ fontSize: "1.8rem", color: "#92400e", display: "block" }}>{data.inventory.filter((item) => item.quantity > 0 && item.quantity < 10).length}</strong>
                <span style={{ color: "#b45309", fontWeight: "bold" }}>Low Stock Alerts</span>
              </div>
            </div>
            <div className="alert-stat error" style={{ flex: 1, padding: "20px", background: "#fee2e2", borderRadius: "12px", border: "1px solid #fecaca", display: "flex", gap: "16px", alignItems: "center" }}>
              <PackageX size={40} color="#dc2626" />
              <div>
                <strong style={{ fontSize: "1.8rem", color: "#991b1b", display: "block" }}>{data.inventory.filter((item) => item.quantity === 0).length}</strong>
                <span style={{ color: "#b91c1c", fontWeight: "bold" }}>Out of Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: "1fr" }}>
        <div className="dashboard-card recent-activity" style={{ padding: "24px" }}>
          <div className="card-header">
            <h3>Recent Audit Events</h3>
            <History size={20} />
          </div>
          <div className="activity-list" style={{ marginTop: "16px" }}>
            {data.audits.slice(0, 10).map((audit) => (
              <div key={audit.id} className="activity-item" style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div className="activity-icon" style={{ marginTop: "4px" }}><Activity size={16} color="#64748b" /></div>
                <div className="activity-content">
                  <strong style={{ color: "#334155", display: "block" }}>{audit.action}</strong>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem", display: "block", marginTop: "4px" }}>by {audit.userEmail} on {new Date(audit.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {data.audits.length === 0 && <p className="empty" style={{ padding: "16px 0", color: "#64748b" }}>No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, color, onClick }) {
  return (
    <article className={`stat stat-${color}`} onClick={onClick} style={onClick ? { cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" } : {}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function Customers({ canEdit, session }) {
  const empty = { name: "", mobile: "", email: "", address: "", assignedUserId: "" };
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [pendingEdit, setPendingEdit] = useState({});
  const [emptyMsg, setEmptyMsg] = useState("No records yet");
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const load = () => {
    const customersRequest = api("/customers").catch(() => []);
    const usersRequest = (canEdit && session?.role !== "USER") ? api("/users/assignable").catch(() => []) : Promise.resolve([]);
    return Promise.all([customersRequest, usersRequest]).then(([customers, assignableUsers]) => {
      const visCust = applyVisibility(customers, "customers", session, assignableUsers);
      if (!visCust.length) {
        setItems([]);
        setEmptyMsg(customers?.message || "No records yet");
      } else {
        setItems(visCust);
        setEmptyMsg("");
      }
      setUsers(Array.isArray(assignableUsers) ? assignableUsers : []);
    });
  };
  useEffect(() => { load(); }, []);

  const handleSaveRow = async (id) => {
    const row = pendingEdit[id];
    if (!row) return;
    const method = "PUT";
    const path = `/customers/${id}`;
    try {
      await api(path, { method, body: JSON.stringify({ ...row, assignedUserId: row.assignedUserId ? Number(row.assignedUserId) : null }) });
      setPendingEdit(prev => { const next = { ...prev }; delete next[id]; return next; });
      load();
      setSuccessMsg("Saved successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  async function saveForm(event) {
    event.preventDefault();
    const payload = { ...form, assignedUserId: form.assignedUserId ? Number(form.assignedUserId) : null };
    const method = form.id ? "PUT" : "POST";
    const path = form.id ? `/customers/${form.id}` : "/customers";
    try {
      await api(path, { method, body: JSON.stringify(payload) });
      setForm(empty);
      load();
      setSuccessMsg("Saved successfully");
      setErrMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      let m = err.message;
      if (m.includes("{")) {
        try { m = JSON.parse(m).message || m; } catch (e) { }
      }
      setErrMsg(m);
    }
  }

  const updatePending = (id, field, value) => {
    const original = items.find(i => i.id === id);
    setPendingEdit(prev => {
      const current = prev[id] || { ...original };
      return { ...prev, [id]: { ...current, [field]: value } };
    });
  };

  const renderCell = (row, col) => {
    const val = pendingEdit[row.id] !== undefined ? pendingEdit[row.id][col] : row[col];
    
    if (col === "name") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="user-avatar" style={{ background: "#f0fdf4", color: "#166534" }}>{getInitials(row.name)}</div>
          <span style={{ fontWeight: 600 }}>{row.name}</span>
        </div>
      );
    }
    
    if (!canEdit) {
      if (col === "assignedUserName") {
         return (
           <div style={{ display: "flex", alignItems: "center" }}>
             {row.assignedUserName && row.assignedUserName !== "Unassigned" && <div className="user-avatar" style={{ width: "20px", height: "20px", fontSize: "9px" }}>{getInitials(row.assignedUserName)}</div>}
             <span style={{ fontStyle: "italic", color: row.assignedUserName && row.assignedUserName !== "Unassigned" ? "#146c72" : "#64748b", fontWeight: row.assignedUserName && row.assignedUserName !== "Unassigned" ? "bold" : "normal" }}>{row.assignedUserName || "Unassigned"}</span>
           </div>
         );
      }
      return row[col];
    }
    
    if (col === "assignedUserName") {
      const currentId = pendingEdit[row.id] !== undefined ? pendingEdit[row.id].assignedUserId : row.assignedUserId;
      return <select style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc", background: "transparent" }} value={currentId || ""} onChange={e => {
        updatePending(row.id, "assignedUserId", e.target.value);
        const u = users.find(x => x.id === Number(e.target.value));
        updatePending(row.id, "assignedUserName", u ? u.name : "");
      }}><option value="">{session.role === "USER" ? "Assign to Me" : "Unassigned"}</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>;
    }
    return String(row[col] ?? "");
  };

  const actionCell = (row) => {
    const isEditing = !!pendingEdit[row.id];
    const hasChanges = isEditing && JSON.stringify(pendingEdit[row.id]) !== JSON.stringify(items.find(i => i.id === row.id));
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end" }}>
        {hasChanges && (
          <button style={{ background: "#146c72", color: "white", padding: "0.25rem 0.5rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: "bold" }} onClick={() => handleSaveRow(row.id)}>
            <Save size={14} /> Save
          </button>
        )}
        {canEdit && (
          <button onClick={async () => {
            try {
              const res = await api(`/customers/${row.id}`, { method: "DELETE" });
              if (res && res.message) { setSuccessMsg(res.message); setTimeout(() => setSuccessMsg(""), 3000); }
              load();
            } catch (err) { alert(err.message); }
          }} style={{ background: "transparent", color: "#e11d48", padding: "0.25rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="split">
      {canEdit && (
        <form className="entity-form" onSubmit={saveForm}>
          <h2>{form.id ? "Edit Customer" : "Add Customer"}</h2>
          {errMsg && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", fontWeight: "bold", padding: "8px", background: "#fef2f2", borderRadius: "4px", border: "1px solid #f87171" }}>{errMsg}</div>}
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Mobile<input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></label>
          <label>Assignee
            <select value={form.assignedUserId || ""} onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}>
              <option value="">{session.role === "USER" ? "Assign to Me" : "Unassigned"}</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="primary" style={{ flex: 1 }}><Save size={16} /> Save</button>
            {form.id && <button type="button" onClick={() => setForm(empty)} style={{ background: "transparent", color: "var(--text-light)" }}>Cancel</button>}
          </div>
        </form>
      )}

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Customer Directory</h2>
        </div>
        {successMsg && <div className="success" style={{ padding: "1rem", background: "var(--surface)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>{successMsg}</div>}
        <Table rows={items} columns={["name", "mobile", "email", "address", "assignedUserName", "modifiedAt", "modifiedBy"]} renderCell={renderCell} onEdit={canEdit ? setForm : null} customAction={actionCell} emptyMessage={emptyMsg} />
      </div>
    </section>
  );
}

function Requirements({ canDelete, session }) {
  const empty = { customerId: "", title: "", description: "", priority: "MEDIUM", status: "ACTIVE", dueDate: "", quantity: "" };
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [pendingEdit, setPendingEdit] = useState({});
  const [emptyMsg, setEmptyMsg] = useState("No records yet");
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [inventory, setInventory] = useState([]);
  const [stockInfo, setStockInfo] = useState({ message: "", type: "" });
  const [activeTab, setActiveTab] = useState("active");
  const [users, setUsers] = useState([]);

  const activeItems = items.filter(r => r.status !== "COMPLETED");
  const completedItems = items.filter(r => r.status === "COMPLETED");
  const load = () => Promise.all([
    api("/requirements").catch(() => []),
    api("/customers").catch(() => []),
    api("/inventory").catch(() => []),
    session.role !== "USER" ? api("/users").catch(() => []) : Promise.resolve([])
  ]).then(([reqs, custs, inv, users]) => {
    const visReqs = applyVisibility(reqs, "requirements", session, users);
    if (!visReqs.length) {
      setItems([]);
      setEmptyMsg(reqs?.message || "No records yet");
    } else {
      setItems(visReqs);
      setEmptyMsg("");
    }
    setCustomers(applyVisibility(custs, "customers", session, users));
    setInventory(Array.isArray(inv) ? inv : []);
    setUsers(Array.isArray(users) ? users : []);
  });
  useEffect(() => { load(); }, []);

  const handleSaveRow = async (id) => {
    const row = pendingEdit[id];
    if (!row) return;
    const method = "PUT";
    const path = `/requirements/${id}`;
    try {
      await api(path, { method, body: JSON.stringify({ ...row, customerId: Number(row.customerId || row.customer?.id) }) });
      setPendingEdit(prev => { const next = { ...prev }; delete next[id]; return next; });
      load();
      setSuccessMsg("Saved successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  async function saveForm(event) {
    event.preventDefault();
    const payload = { ...form, customerId: Number(form.customerId) };
    const method = form.id ? "PUT" : "POST";
    const path = form.id ? `/requirements/${form.id}` : "/requirements";
    try {
      await api(path, { method, body: JSON.stringify(payload) });
      setForm(empty);
      setStockInfo({ message: "", type: "" });
      load();
      setSuccessMsg("Saved successfully");
      setErrMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      let m = err.message;
      if (m.includes("{")) {
        try { m = JSON.parse(m).message || m; } catch (e) { }
      }
      setErrMsg(m);
    }
  }

  const updatePending = (id, field, value) => {
    const original = items.find(i => i.id === id);
    setPendingEdit(prev => {
      const current = prev[id] || { ...original };
      return { ...prev, [id]: { ...current, [field]: value } };
    });
  };

  const renderCell = (row, col) => {
    const val = pendingEdit[row.id] !== undefined ? pendingEdit[row.id][col] : row[col];
    if (col === "status") {
      return <select style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc", background: "transparent" }} value={val || ""} onChange={e => updatePending(row.id, "status", e.target.value)}>{statuses.map((v) => <option key={v}>{v}</option>)}</select>;
    }
    if (col === "assignedUser") {
      const assignedName = row.assignedUser?.name || "Unassigned";
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          {row.assignedUser && <div className="user-avatar" style={{ width: "20px", height: "20px", fontSize: "9px" }}>{getInitials(assignedName)}</div>}
          <span style={{ fontStyle: "italic", color: row.assignedUser ? "#146c72" : "#64748b", fontWeight: row.assignedUser ? "bold" : "normal" }}>{assignedName}</span>
        </div>
      );
    }
    if (col === "customerName") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="user-avatar" style={{ background: "#f0fdf4", color: "#166534" }}>{getInitials(row.customerName)}</div>
          <span style={{ fontWeight: 600 }}>{row.customerName}</span>
        </div>
      );
    }
    return String(row[col] ?? "");
  };

  const actionCell = (row) => {
    const isEditing = !!pendingEdit[row.id];
    const hasChanges = isEditing && JSON.stringify(pendingEdit[row.id]) !== JSON.stringify(items.find(i => i.id === row.id));
    
    const me = users.find(u => u.email === session.email);
    const myId = me ? me.id : "";
    const assignableUsers = users.filter(u => u.id === myId || (u.role === "USER" && u.assignedAdminName === session.name));
    
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
        {(session.role === "ADMIN" || session.role === "SUPER_ADMIN") && (
          <select 
            style={{ 
              padding: "0.4rem 0.8rem", 
              borderRadius: "6px", 
              border: row.assignedUser ? "1px solid #146c72" : "1px solid #f59e0b", 
              background: row.assignedUser ? "#f0fdfa" : "#fffbeb", 
              color: row.assignedUser ? "#0f766e" : "#b45309", 
              fontSize: "0.85rem", 
              fontWeight: "bold", 
              cursor: "pointer",
              minWidth: "135px"
            }}
            value={row.assignedUser?.id || ""}
            onChange={async (e) => {
              const uId = e.target.value;
              try {
                await api(`/requirements/${row.id}/assign`, { method: "PUT", body: JSON.stringify({ userId: uId ? Number(uId) : null }) });
                setSuccessMsg(uId ? "Requirement assigned successfully" : "Requirement unassigned");
                setTimeout(() => setSuccessMsg(""), 3000);
                load();
              } catch (err) { alert(err.message); }
            }}
          >
            <option value="">Unassigned</option>
            {session.role === "ADMIN" && myId && <option value={myId}>Assign to Me</option>}
            {(session.role === "SUPER_ADMIN" ? users : assignableUsers.filter(u => u.id !== myId)).map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}
        {hasChanges && (
          <button style={{ background: "#146c72", color: "white", padding: "0.25rem 0.5rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: "bold" }} onClick={() => handleSaveRow(row.id)}>
            <Save size={14} /> Save
          </button>
        )}
        {canDelete && (
          <button onClick={async () => {
            try {
              const res = await api(`/requirements/${row.id}`, { method: "DELETE" });
              if (res && res.message) { setSuccessMsg(res.message); setTimeout(() => setSuccessMsg(""), 3000); }
              load();
            } catch (err) { alert(err.message); }
          }} style={{ background: "transparent", color: "#e11d48", padding: "0.25rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="split">
      <form className="entity-form" onSubmit={saveForm}>
        <h2>{form.id ? "Edit Requirement" : "Add Requirement"}</h2>
        {errMsg && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", fontWeight: "bold", padding: "8px", background: "#fef2f2", borderRadius: "4px", border: "1px solid #f87171" }}>{errMsg}</div>}
        <label>Customer
          <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Product Name (Title)
          <select value={form.title || ""} onChange={(e) => {
            const val = e.target.value;
            setForm({ ...form, title: val });
            const selectedInv = inventory.find(i => i.product === val);
            if (selectedInv) {
              if (selectedInv.quantity > 0) {
                setStockInfo({ message: `Product stock available! (Quantity: ${selectedInv.quantity})`, type: "success" });
              } else {
                setStockInfo({ message: "Product out of stock!", type: "error" });
              }
              setTimeout(() => setStockInfo({ message: "", type: "" }), 4000);
            }
          }} required>
            <option value="">Select Product from Inventory</option>
            {Array.from(new Set(inventory.map(i => i.product).filter(Boolean))).map((product) => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </label>
        <label>Quantity
          <input type="number" min="1" value={form.quantity || ""} onChange={(e) => {
            const qty = Number(e.target.value);
            setForm({ ...form, quantity: e.target.value });
            if (form.title) {
              const selectedInv = inventory.find(i => i.product === form.title);
              if (selectedInv) {
                const totalAvailable = inventory.filter(i => i.product === form.title).reduce((sum, i) => sum + i.quantity, 0);
                if (qty > totalAvailable) {
                  setStockInfo({ message: `Product out of stock! Requested ${qty} but only ${totalAvailable} available.`, type: "error" });
                } else {
                  setStockInfo({ message: `Stock available.`, type: "success" });
                }
              }
            }
          }} />
        </label>
        {stockInfo.message && (
          <div className={stockInfo.type === "success" ? "success" : "error"} style={{ padding: "0.75rem", background: "var(--surface)", borderLeft: `4px solid ${stockInfo.type === "success" ? "var(--primary)" : "var(--error)"}`, borderRadius: "var(--radius)", marginBottom: "1rem", marginTop: "-0.5rem" }}>
            {stockInfo.message}
          </div>
        )}
        <label>Description<textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Due Date<input type="date" value={form.dueDate || ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="primary" style={{ flex: 1 }}><Save size={16} /> Save</button>
          {form.id && <button type="button" onClick={() => setForm(empty)} style={{ background: "transparent", color: "var(--text-light)" }}>Cancel</button>}
        </div>
      </form>

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div className="tabs" style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #d8e0ea" }}>
            <button type="button" className={activeTab === "active" ? "active-tab" : "inactive-tab"} onClick={() => setActiveTab("active")} style={{ background: "none", border: "none", borderBottom: activeTab === "active" ? "2px solid #146c72" : "none", color: activeTab === "active" ? "#146c72" : "#667085", fontWeight: "bold", padding: "0.5rem 1rem", cursor: "pointer" }}>Active Requirements</button>
            <button type="button" className={activeTab === "completed" ? "active-tab" : "inactive-tab"} onClick={() => setActiveTab("completed")} style={{ background: "none", border: "none", borderBottom: activeTab === "completed" ? "2px solid #146c72" : "none", color: activeTab === "completed" ? "#146c72" : "#667085", fontWeight: "bold", padding: "0.5rem 1rem", cursor: "pointer" }}>Completed</button>
          </div>
        </div>
        {successMsg && <div className="success" style={{ padding: "1rem", background: "var(--surface)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>{successMsg}</div>}

        {activeTab === "active" && (
          <Table rows={activeItems.map((r) => ({ ...r, customerName: r.customer?.name, customerId: r.customer?.id }))} columns={["customerName", "title", "quantity", "assignedUser", "description", "priority", "status", "dueDate", "modifiedAt", "modifiedBy"]} renderCell={renderCell} onEdit={(row) => setForm({ ...row, customerId: row.customer?.id })} customAction={actionCell} emptyMessage={emptyMsg} />
        )}

        {activeTab === "completed" && (
          <Table rows={completedItems.map((r) => ({ ...r, customerName: r.customer?.name, customerId: r.customer?.id }))} columns={["customerName", "title", "quantity", "assignedUser", "description", "priority", "status", "dueDate", "modifiedAt", "modifiedBy"]} renderCell={renderCell} onEdit={(row) => setForm({ ...row, customerId: row.customer?.id })} customAction={actionCell} emptyMessage={emptyMsg} />
        )}
      </div>
    </section>
  );
}

function Inventory({ canUpload }) {
  const fileInputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emptyMsg, setEmptyMsg] = useState("No records yet");
  const [pendingEdit, setPendingStatus] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [cardError, setCardError] = useState(null);
  const load = () => api("/inventory").then(data => {
    if (data?.message || !Array.isArray(data)) {
      setItems([]);
      setEmptyMsg(data?.message || "No records yet");
    } else {
      setItems(data);
      setEmptyMsg("No records yet");
    }
  });
  useEffect(() => { load(); }, []);

  const handleAddRow = () => {
    const newId = "new-" + Date.now();
    const newRow = { id: newId, category: "", product: "", variant: "", quantity: 0, price: 0, uploadedAt: "", modifiedAt: "", modifiedBy: "" };
    setItems([newRow, ...items]);
    setPendingStatus({ ...pendingEdit, [newId]: newRow });
  };

  async function uploadInventory(event) {
    event.preventDefault();
    if (!file) {
      setError("Choose an Excel file first.");
      return;
    }
    setError("");
    setMessage("");
    const session = JSON.parse(localStorage.getItem("crms-session") || "null");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_URL}/inventory/upload`, {
      method: "POST",
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      body: formData
    });
    if (!response.ok) {
      setError("Inventory upload failed. Check the Excel columns and try again.");
      return;
    }
    const result = await response.json();
    setMessage(`${result.uploadedCount} inventory rows uploaded.`);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    load();
  }

  return (
    <section className="split">
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {canUpload && (
          <form className="entity-form" onSubmit={uploadInventory}>
            <h2>Excel Upload</h2>
            <label>Inventory File<input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
            <button className="primary"><Upload size={16} /> Upload</button>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
          </form>
        )}
        <div style={{ padding: "18px", border: "1px solid #d8e0ea", borderRadius: "8px", background: "white" }}>
          <h2>Manual Entry</h2>
          <button type="button" onClick={handleAddRow} className="primary" style={{ marginTop: "10px" }}><Plus size={16} /> Add Inventory Row</button>
        </div>
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {items.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", gridColumn: "1 / -1", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>{emptyMsg}</div>
          ) : (
            items.map(row => {
              const isEditing = pendingEdit[row.id] !== undefined;
              const val = (col) => isEditing ? pendingEdit[row.id][col] : row[col];
              const setVal = (col, value) => setPendingStatus({ ...pendingEdit, [row.id]: { ...(pendingEdit[row.id] || row), [col]: value } });
              const hasChanged = isEditing && JSON.stringify(pendingEdit[row.id]) !== JSON.stringify(row);

              const getCategoryIcon = (category) => {
                const cat = (category || "").toLowerCase();
                if (cat.includes("phone") || cat.includes("mobile")) return <Smartphone size={32} color="#146c72" />;
                if (cat.includes("laptop") || cat.includes("computer") || cat.includes("pc")) return <Laptop size={32} color="#146c72" />;
                if (cat.includes("monitor") || cat.includes("screen") || cat.includes("display")) return <Monitor size={32} color="#146c72" />;
                if (cat.includes("server") || cat.includes("network")) return <Server size={32} color="#146c72" />;
                if (cat.includes("audio") || cat.includes("headphone") || cat.includes("speaker") || cat.includes("sound")) return <Headphones size={32} color="#146c72" />;
                if (cat.includes("drive") || cat.includes("storage") || cat.includes("ssd") || cat.includes("hdd")) return <HardDrive size={32} color="#146c72" />;
                if (cat.includes("cpu") || cat.includes("processor") || cat.includes("chip")) return <Cpu size={32} color="#146c72" />;
                if (cat.includes("print")) return <Printer size={32} color="#146c72" />;
                if (cat.includes("mouse") || cat.includes("mice")) return <Mouse size={32} color="#146c72" />;
                if (cat.includes("keyboard")) return <Keyboard size={32} color="#146c72" />;
                return <Package size={32} color="#146c72" />;
              };

              return (
                <div key={row.id} className="inventory-card" style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", position: "relative", overflow: "hidden" }}>
                  {deletingId === row.id && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, padding: "20px", textAlign: "center", backdropFilter: "blur(2px)" }}>
                      {cardError && cardError.id === row.id ? (
                        <>
                          <AlertCircle size={36} color="#e11d48" style={{ marginBottom: "12px" }} />
                          <h4 style={{ margin: "0 0 8px 0", color: "#e11d48", fontSize: "1.05rem" }}>Cannot Delete</h4>
                          <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#475569", lineHeight: "1.4" }}>{cardError.msg}</p>
                          <button type="button" onClick={() => { setDeletingId(null); setCardError(null); }} style={{ padding: "6px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold", color: "#475569" }}>Okay</button>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={36} color="#e11d48" style={{ marginBottom: "12px" }} />
                          <h4 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1.1rem" }}>Delete Item?</h4>
                          <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b" }}>This action cannot be undone.</p>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <button type="button" onClick={() => { setDeletingId(null); setCardError(null); }} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold", color: "#475569" }}>Cancel</button>
                            <button type="button" onClick={async () => {
                              try {
                                await api(`/inventory/${row.id}`, { method: "DELETE" });
                                setDeletingId(null);
                                load();
                              } catch (err) {
                                let m = err.message;
                                try { m = JSON.parse(m).message || m; } catch(e) {}
                                setCardError({ id: row.id, msg: m });
                              }
                            }} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#e11d48", color: "white", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ background: "#f0fdfa", padding: "12px", borderRadius: "10px", display: "inline-flex" }}>
                      {getCategoryIcon(val("category") || val("product"))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {hasChanged && (
                        <button type="button" onClick={async () => {
                            const isNew = String(row.id).startsWith("new-");
                            const payload = { ...pendingEdit[row.id] };
                            if (isNew) delete payload.id;
                            await api(isNew ? `/inventory` : `/inventory/${row.id}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(payload) });
                            const newPending = { ...pendingEdit };
                            delete newPending[row.id];
                            setPendingStatus(newPending);
                            load();
                        }} style={{ background: "#146c72", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Save size={14} /> Save
                        </button>
                      )}
                      <button type="button" onClick={() => {
                        const isNew = String(row.id).startsWith("new-");
                        if (isNew) {
                          setItems(prev => prev.filter(i => i.id !== row.id));
                          const newPending = { ...pendingEdit };
                          delete newPending[row.id];
                          setPendingStatus(newPending);
                        } else {
                          setDeletingId(row.id);
                        }
                      }} style={{ background: "transparent", color: "#e11d48", border: "1px solid #fecdd3", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, marginTop: "8px" }}>
                    {isEditing ? (
                      <>
                        <input placeholder="Product" value={val("product") || ""} onChange={e => setVal("product", e.target.value)} style={{ fontWeight: "bold", fontSize: "1.1rem", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px" }} />
                        <input placeholder="Category" value={val("category") || ""} onChange={e => setVal("category", e.target.value)} style={{ fontSize: "0.9rem", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px" }} />
                        <input placeholder="Variant" value={val("variant") || ""} onChange={e => setVal("variant", e.target.value)} style={{ fontSize: "0.9rem", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px" }} />
                      </>
                    ) : (
                      <>
                        <h3 style={{ margin: "0", fontSize: "1.2rem", color: "#0f172a", cursor: "pointer" }} onClick={() => setVal("product", row.product)} title="Click to edit product name">{row.product || "New Product"}</h3>
                        <div style={{ color: "#64748b", fontSize: "0.9rem", cursor: "pointer" }} onClick={() => setVal("category", row.category)} title="Click to edit category/variant">{row.category || "No Category"} • {row.variant || "Standard"}</div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "4px" }}>Quantity</div>
                      {isEditing ? (
                        <input type="number" value={val("quantity") === 0 ? 0 : (val("quantity") || "")} onChange={e => setVal("quantity", e.target.value === "" ? "" : Number(e.target.value))} style={{ width: "100%", padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} />
                      ) : (
                        <div onClick={() => setVal("quantity", row.quantity)} style={{ fontWeight: "bold", fontSize: "1.1rem", color: val("quantity") > 0 ? "#16a34a" : "#dc2626", cursor: "pointer" }} title="Click to edit quantity">
                          {row.quantity} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>units</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "4px" }}>Price</div>
                      {isEditing ? (
                        <input type="number" value={val("price") === 0 ? 0 : (val("price") || "")} onChange={e => setVal("price", e.target.value === "" ? "" : Number(e.target.value))} style={{ width: "100%", padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} />
                      ) : (
                        <div onClick={() => setVal("price", row.price)} style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#0f172a", cursor: "pointer" }} title="Click to edit price">
                          ₹{row.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function Collections({ canEdit, session }) {
  const today = new Date().toISOString().slice(0, 10);
  const empty = {
    customerId: "", requirementId: "", couponAvailable: false, couponNumber: "",
    couponValue: "", productValue: "", quantity: "1", collectedAmount: "", paymentMode: "CASH", collectedById: "", collectionDate: today
  };
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [emptyMsg, setEmptyMsg] = useState("No records yet");
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const load = () => Promise.all([
    api("/collections").catch(() => []),
    api("/customers").catch(() => []),
    api("/requirements").catch(() => []),
    api("/inventory").catch(() => []),
    (canEdit && session?.role !== "USER") ? api("/users/assignable").catch(() => []) : Promise.resolve([])
  ]).then(([collections, customerList, reqs, invs, assignableUsers]) => {
    const visCols = applyVisibility(collections, "collections", session, assignableUsers);
    if (!visCols.length) {
      setItems([]);
      setEmptyMsg(collections?.message || "No records yet");
    } else {
      setItems(visCols);
      setEmptyMsg("");
    }
    setCustomers(applyVisibility(customerList, "customers", session, assignableUsers));
    setRequirements(applyVisibility(reqs, "requirements", session, assignableUsers));
    setInventory(Array.isArray(invs) ? invs : []);
    setUsers(Array.isArray(assignableUsers) ? assignableUsers : []);
  });
  useEffect(() => { load(); }, []);

  async function saveForm(event) {
    event.preventDefault();
    const payload = {
      ...form,
      customerId: Number(form.customerId),
      requirementId: form.requirementId ? Number(form.requirementId) : null,
      couponValue: Number(form.couponValue || 0),
      productValue: Number(form.productValue || 0),
      collectedAmount: Number(form.collectedAmount || 0),
      collectedById: session.role !== "USER" ? Number(form.collectedById) : null
    };
    if (!payload.couponAvailable) {
      payload.couponNumber = "";
      payload.couponValue = 0;
    }
    const method = form.id ? "PUT" : "POST";
    const path = form.id ? `/collections/${form.id}` : "/collections";
    try {
      await api(path, { method, body: JSON.stringify(payload) });
      setForm(empty);
      load();
      setSuccessMsg("Saved successfully");
      setErrMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      let m = err.message;
      if (m.includes("{")) {
        try { m = JSON.parse(m).message || m; } catch (e) { }
      }
      setErrMsg(m);
    }
  }

  const renderCell = (row, col) => {
    if (col === "couponAvailable") {
      return (row.couponAvailable === true || row.couponAvailable === "Yes") ? "Yes" : "No";
    }
    if (col === "couponNumber" || col === "couponValue") {
      const isAvail = row.couponAvailable === true || row.couponAvailable === "Yes";
      return isAvail ? String(row[col] || "") : "-";
    }
    if (col === "additionalAmount") {
      const p = row.productValue;
      const c = row.couponValue;
      return (Number(p || 0) - Number(c || 0)).toFixed(2);
    }
    return String(row[col] ?? "");
  };

  const actionCell = (row) => {
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end" }}>
        {canEdit && (
          <button onClick={async () => {
            try {
              const res = await api(`/collections/${row.id}`, { method: "DELETE" });
              if (res && res.message) { setSuccessMsg(res.message); setTimeout(() => setSuccessMsg(""), 3000); }
              load();
            } catch (err) { alert(err.message); }
          }} style={{ background: "transparent", color: "#e11d48", padding: "0.25rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="split">
      {canEdit && (
        <form className="entity-form" onSubmit={saveForm}>
          <h2>{form.id ? "Edit Collection" : "Add Collection"}</h2>
          {errMsg && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", fontWeight: "bold", padding: "8px", background: "#fef2f2", borderRadius: "4px", border: "1px solid #f87171" }}>{errMsg}</div>}
          <label>Customer
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value, requirementId: "" })} required>
              <option value="">Select Customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Requirement (Optional)
            <select value={form.requirementId || ""} onChange={(e) => {
              const reqId = e.target.value;
              const selectedReq = requirements.find(r => String(r.id) === reqId);
              let updatedQuantity = "1";
              let updatedProductValue = form.productValue || "";

              if (selectedReq) {
                updatedQuantity = selectedReq.quantity ? String(selectedReq.quantity) : "1";
                const selectedInv = inventory.find(i => i.product === selectedReq.title);
                if (selectedInv && selectedInv.price) {
                  updatedProductValue = String(selectedInv.price);
                }
              }

              setForm({ ...form, requirementId: reqId, quantity: updatedQuantity, productValue: updatedProductValue });
            }}>
              <option value="">None</option>
              {requirements.filter((r) => String(r.customer?.id) === String(form.customerId)).map((r) => {
                const isAvailable = r.status === "IN_PROGRESS" || String(r.id) === String(form.requirementId);
                return (
                  <option key={r.id} value={String(r.id)} disabled={!isAvailable}>
                    {r.title} {!isAvailable ? "(Not In Progress)" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="check" style={{ margin: "0.5rem 0" }}>
            <input type="checkbox" checked={form.couponAvailable} onChange={(e) => setForm({ ...form, couponAvailable: e.target.checked })} />
            Coupon Available
          </label>
          {form.couponAvailable && (
            <div style={{ display: "flex", gap: "1rem" }}>
              <label style={{ flex: 1 }}>Coupon No<input value={form.couponNumber} onChange={(e) => setForm({ ...form, couponNumber: e.target.value })} required={form.couponAvailable} /></label>
              <label style={{ flex: 1 }}>Coupon Value<input type="number" step="0.01" value={form.couponValue} onChange={(e) => setForm({ ...form, couponValue: e.target.value })} required={form.couponAvailable} /></label>
            </div>
          )}
          <div style={{ display: "flex", gap: "1rem" }}>
            <label style={{ flex: 1 }}>Product Value<input type="number" step="0.01" value={form.productValue} onChange={(e) => setForm({ ...form, productValue: e.target.value })} disabled={!!form.requirementId} style={{ background: form.requirementId ? "#f1f5f9" : "white", cursor: form.requirementId ? "not-allowed" : "text" }} required /></label>
            <label style={{ flex: 1 }}>Quantity<input type="number" min="1" value={form.quantity || "1"} onChange={(e) => setForm({ ...form, quantity: e.target.value })} disabled={!!form.requirementId} style={{ background: form.requirementId ? "#f1f5f9" : "white", cursor: form.requirementId ? "not-allowed" : "text" }} required /></label>
            <label style={{ flex: 1 }}>Collected Amt<input type="number" step="0.01" value={form.collectedAmount} onChange={(e) => setForm({ ...form, collectedAmount: e.target.value })} required /></label>
          </div>
          <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", fontSize: "0.9rem", color: "#475569", border: "1px solid #e2e8f0" }}>
            <strong>Addl Amount Needed: </strong>
            ₹{((Number(form.productValue || 0) * Number(form.quantity || 1)) - Number(form.couponAvailable ? form.couponValue || 0 : 0)).toFixed(2)}
          </div>
          {session.role !== "USER" ? (
            <label>Collected By
              <select value={form.collectedById} onChange={(e) => setForm({ ...form, collectedById: e.target.value })} required>
                <option value="">Select User</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          ) : (
            <label>Collected By
              <input value={session.name} disabled style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }} />
            </label>
          )}
          <label>Payment Mode
            <select value={form.paymentMode || "CASH"} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} required>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
            </select>
          </label>
          <label>Date<input type="date" value={form.collectionDate} onChange={(e) => setForm({ ...form, collectionDate: e.target.value })} required /></label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="primary" style={{ flex: 1 }}><Save size={16} /> Save</button>
            {form.id && <button type="button" onClick={() => setForm(empty)} style={{ background: "transparent", color: "var(--text-light)" }}>Cancel</button>}
          </div>
        </form>
      )}

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Coupon Collection</h2>
        </div>
        {successMsg && <div className="success" style={{ padding: "1rem", background: "var(--surface)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>{successMsg}</div>}
        <Table
          rows={items}
          columns={["customerName", "requirementTitle", "couponAvailable", "couponNumber", "couponValue", "productValue", "quantity", "additionalAmount", "collectedAmount", "paymentMode", "collectedByName", "collectionDate", "modifiedAt", "modifiedBy"]}
          renderCell={renderCell}
          onEdit={canEdit ? (row) => setForm({ ...row, couponAvailable: row.couponAvailable === true || row.couponAvailable === "Yes" }) : null}
          customAction={actionCell}
          emptyMessage={emptyMsg}
        />
      </div>
    </section>
  );
}

function Reports({ session }) {
  const [items, setItems] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [reportTab, setReportTab] = useState("collections");

  const load = () => Promise.all([
    api("/collections").catch(() => []),
    (session?.role !== "USER") ? api("/users/assignable").catch(() => []) : Promise.resolve([])
  ]).then(([collections, assignableUsers]) => {
    setItems(applyVisibility(collections, "collections", session, assignableUsers));
  });
  useEffect(() => { load(); }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedRowId) return;
    setUploadStatus("Uploading...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const session = JSON.parse(localStorage.getItem("crms-session") || "null");
      const token = session?.token;
      const res = await fetch(`/api/collections/${selectedRowId}/evidence`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setUploadStatus("Upload successful");
        setTimeout(() => setUploadStatus(""), 3000);
        load();
      } else {
        const err = await res.json();
        setUploadStatus(`Upload failed: ${err.message}`);
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedRowId(null);
    }
  };

  const triggerUpload = (id) => {
    setSelectedRowId(id);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const updateVerification = async (id, verified) => {
    try {
      const session = JSON.parse(localStorage.getItem("crms-session") || "null");
      const token = session?.token;
      const res = await fetch(`/api/collections/${id}/verify?verified=${verified}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        load();
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.message}`);
      }
    } catch (error) {
      alert(`Error updating status: ${error.message}`);
    }
  };

  const renderCell = (row, col) => {
    if (col === "paymentVerified") {
      return (
        <select value={row.paymentVerified ? "VERIFIED" : "PENDING"} onChange={(e) => {
          if (e.target.value === "VERIFIED" && !row.evidencePath) {
            setUploadStatus("❌ Error: Cannot verify payment without uploaded evidence.");
            setTimeout(() => setUploadStatus(""), 4000);
            e.target.value = "PENDING";
            return;
          }
          updateVerification(row.id, e.target.value === "VERIFIED");
        }} style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc", fontWeight: "bold", color: row.paymentVerified ? "#10b981" : "#f59e0b", outline: "none" }}>
          <option value="PENDING" style={{ color: "#f59e0b" }}>PENDING</option>
          <option value="VERIFIED" style={{ color: "#10b981" }}>VERIFIED</option>
        </select>
      );
    }
    if (col === "evidencePath") {
      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {row.evidencePath ? (
            <>
              <a href={row.evidencePath} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>View Proof</a>
              <a href={row.evidencePath} download={row.evidencePath.split('/').pop()} style={{ background: "#e2e8f0", color: "#334155", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", cursor: "pointer", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}>Download</a>
            </>
          ) : <span style={{ color: "#94a3b8" }}>No Proof</span>}
          <button onClick={() => triggerUpload(row.id)} style={{ background: "var(--primary)", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "11px" }}>Upload</button>
        </div>
      );
    }
    return String(row[col] ?? "");
  };

  const cashFlowMap = new Map();
  if ((session.role === "SUPER_ADMIN" || session.role === "ADMIN") && reportTab === "cash_flow") {
    items.forEach(c => {
      const key = `${c.collectedById}-${c.requirementId || 'no-req'}`;
      if (!cashFlowMap.has(key)) {
        cashFlowMap.set(key, {
          gro: c.collectedByName,
          groEmail: c.collectedByEmail,
          requirement: c.requirementTitle || "General",
          admin: c.collectorAssignedAdminName || "N/A",
          adminEmail: c.collectorAssignedAdminEmail,
          deposited: 0,
          withGro: 0,
          pendingBank: 0
        });
      }
      const entry = cashFlowMap.get(key);
      if (c.paymentVerified) {
        entry.deposited += Number(c.collectedAmount || 0);
      } else {
        if (c.paymentMode === "CASH") {
          entry.withGro += Number(c.collectedAmount || 0);
        } else {
          entry.pendingBank += Number(c.collectedAmount || 0);
        }
      }
    });
  }
  const cashFlowData = Array.from(cashFlowMap.values()).map((cf, idx) => ({
    ...cf,
    id: idx,
    status: cf.withGro > 0 ? "PENDING SETTLEMENT" : (cf.pendingBank > 0 ? "PENDING BANK" : "SETTLED")
  }));

  const renderCashFlowCell = (row, col) => {
    if (col === "deposited" || col === "withGro" || col === "pendingBank") {
      return `₹${row[col].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (col === "status") {
      let clsName = "status-settled";
      if (row.status === "PENDING SETTLEMENT") clsName = "status-pending";
      if (row.status === "PENDING BANK") clsName = "status-medium";
      return (
        <span className={`status-badge ${clsName}`}>
          <div className="status-dot"></div>
          {row.status}
        </span>
      );
    }
    if (col === "gro" || col === "admin") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="user-avatar">{getInitials(row[col])}</div>
          <span style={{ fontWeight: 600 }}>{row[col]}</span>
        </div>
      );
    }
    return row[col];
  };

  const handleNotify = async (row) => {
    const emails = [row.groEmail, row.adminEmail].filter(Boolean);
    if (emails.length === 0) return alert("No emails available to notify.");
    const message = `Please deposit the amount that is cash to company account for requirement: ${row.requirement}. Pending Amount: ₹${row.withGro.toFixed(2)}`;
    try {
      const sessionData = JSON.parse(localStorage.getItem("crms-session") || "null");
      const res = await fetch(`/api/notifications/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionData?.token}` },
        body: JSON.stringify({ emails, message })
      });
      if (res.ok) {
        setUploadStatus("Notifications sent successfully!");
        setTimeout(() => setUploadStatus(""), 3000);
      } else {
        setUploadStatus("Failed to send notifications.");
      }
    } catch (e) {
      setUploadStatus("Error: " + e.message);
    }
  };

  const cashFlowActionCell = (row) => {
    if (row.withGro > 0) {
      return (
        <button onClick={() => handleNotify(row)} style={{ background: "#f59e0b", color: "white", padding: "4px 12px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
          Notify
        </button>
      );
    }
    return null;
  };

  const generateCashFlowCSV = () => {
    const header = ["GRO", "Requirement", "Branch Manager", "Deposited to Company", "Amount with GRO", "Status"];
    const rows = cashFlowData.map(cf => [
      cf.gro,
      cf.requirement,
      cf.admin,
      cf.deposited.toFixed(2),
      cf.withGro.toFixed(2),
      cf.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cash_flow_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalDeposited = cashFlowData.reduce((sum, item) => sum + item.deposited, 0);
  const totalWithGro = cashFlowData.reduce((sum, item) => sum + item.withGro, 0);
  const totalPendingBank = cashFlowData.reduce((sum, item) => sum + item.pendingBank, 0);
  const pendingCount = cashFlowData.filter(i => i.status === "PENDING SETTLEMENT").length;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div className="segmented-tabs">
          <button className={reportTab === "collections" ? "active" : ""} onClick={() => setReportTab("collections")}>Collection Reports</button>
          {(session.role === "SUPER_ADMIN" || session.role === "ADMIN") && (
            <button className={reportTab === "cash_flow" ? "active" : ""} onClick={() => setReportTab("cash_flow")}>Cash Flow</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {uploadStatus && <span style={{ padding: "8px 16px", background: uploadStatus.includes("Error") ? "#fef2f2" : "#e0f2fe", color: uploadStatus.includes("Error") ? "#dc2626" : "#0369a1", borderRadius: "4px", fontWeight: "bold", border: uploadStatus.includes("Error") ? "1px solid #fca5a5" : "none" }}>{uploadStatus}</span>}
          {reportTab === "cash_flow" && cashFlowData.length > 0 && (
            <button onClick={generateCashFlowCSV} style={{ background: "#10b981", color: "white", padding: "8px 16px", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
              <Download size={16} /> Export CSV
            </button>
          )}
        </div>
      </div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
      
      {reportTab === "collections" ? (
        <Table
          rows={items}
          columns={["customerName", "requirementTitle", "productValue", "collectedAmount", "paymentMode", "paymentVerified", "evidencePath", "collectionDate"]}
          renderCell={renderCell}
          emptyMessage="No collections to report yet"
        />
      ) : (
        <>
          <div className="dashboard-row" style={{ marginBottom: "20px" }}>
            <Stat label="Total Deposited" value={`₹${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Wallet size={24} />} color="green" />
            <Stat label="Total Pending with GROs" value={`₹${totalWithGro.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Activity size={24} />} color="orange" />
            <Stat label="Pending Verification (Bank)" value={`₹${totalPendingBank.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<AlertCircle size={24} />} color="indigo" />
          </div>
          <Table
          rows={cashFlowData}
          columns={["gro", "requirement", "admin", "deposited", "withGro", "pendingBank", "status"]}
          renderCell={renderCashFlowCell}
          customAction={cashFlowActionCell}
          emptyMessage="No cash flow data available."
        />
        </>
      )}
    </section>
  );
}

function UsersPage({ session }) {
  const empty = { name: "", email: "", password: "", role: "USER", active: true };
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showNameAvail, setShowNameAvail] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState(session.role === "SUPER_ADMIN" ? "ADMINS" : "MY_USERS");

  const load = () => api("/users").then(data => setItems(Array.isArray(data) ? data : []));
  useEffect(() => { load(); }, []);

  const isNameTaken = form.name.trim().length > 0 && items.some(u => u.name.toLowerCase() === form.name.trim().toLowerCase() && u.id !== form.id);
  const isNameAvailRaw = form.name.trim().length > 2 && !isNameTaken;

  useEffect(() => {
    if (isNameAvailRaw) {
      setShowNameAvail(true);
      const t = setTimeout(() => setShowNameAvail(false), 3000);
      return () => clearTimeout(t);
    } else {
      setShowNameAvail(false);
    }
  }, [form.name, isNameAvailRaw]);

  async function saveForm(event) {
    event.preventDefault();
    if (isNameTaken) {
      setErrMsg("Username already exists");
      return;
    }
    const method = form.id ? "PUT" : "POST";
    const path = method === "PUT" ? `/users/${form.id}` : "/users";
    try {
      await api(path, { method, body: JSON.stringify(form) });
      setForm(empty);
      load();
      setSuccessMsg("Saved successfully");
      setErrMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      let m = err.message;
      if (m.includes("{")) {
        try { m = JSON.parse(m).message || m; } catch (e) { }
      }
      setErrMsg(m);
    }
  }

  const renderCell = (row, col) => {
    if (col === "role") {
      const r = row.role;
      const color = r === "SUPER_ADMIN" ? "#ef4444" : r === "ADMIN" ? "#f59e0b" : "#3b82f6";
      return <span style={{ background: color, color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>{roleLabels[r]}</span>;
    }
    if (col === "active") {
      return <span style={{ color: row.active ? "#10b981" : "#ef4444", fontWeight: "bold" }}>{row.active ? "Active" : "Inactive"}</span>;
    }
    if (col === "assignedAdminName") {
      return <span style={{ color: "#64748b", fontStyle: "italic" }}>{row.assignedAdminName || "None"}</span>;
    }
    return String(row[col] ?? "");
  };

  const actionCell = (row) => {
    const adminList = items.filter(u => u.role === "ADMIN");
    return (
    <>
      {session.role === "SUPER_ADMIN" && row.role === "USER" && (
        <select
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: row.assignedAdminName ? "1px solid #146c72" : "1px solid #f59e0b",
            background: row.assignedAdminName ? "#f0fdfa" : "#fffbeb",
            color: row.assignedAdminName ? "#0f766e" : "#b45309",
            fontSize: "0.85rem",
            fontWeight: "bold",
            cursor: "pointer",
            minWidth: "145px"
          }}
          value={adminList.find(a => a.name === row.assignedAdminName)?.id || ""}
          onChange={async (e) => {
            const adminId = e.target.value;
            try {
              await api(`/users/${row.id}/assign-admin`, { method: "PUT", body: JSON.stringify({ adminId: adminId ? Number(adminId) : null }) });
              setSuccessMsg(adminId ? "Assigned user to branch manager successfully" : "Unassigned user from branch manager");
              setTimeout(() => setSuccessMsg(""), 3000);
              load();
            } catch (err) { alert(err.message); }
          }}
        >
          <option value="">Unassigned</option>
          {adminList.map(a => (
            <option key={a.id} value={a.id}>Assign to: {a.name}</option>
          ))}
        </select>
      )}
      {session.role === "ADMIN" && row.role === "USER" && row.assignedAdminName !== session.name && (
        <button onClick={async () => {
          const res = await api(`/users/${row.id}/assign`, { method: "PUT" });
          if (res) { setSuccessMsg(`Assigned ${row.name} to you`); setTimeout(() => setSuccessMsg(""), 3000); }
          load();
        }} style={{ background: "#f59e0b", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", minWidth: "90px", textAlign: "center", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.8"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>
          Assign
        </button>
      )}
      {session.role === "ADMIN" && row.role === "USER" && row.assignedAdminName === session.name && (
        <button onClick={async () => {
          const res = await api(`/users/${row.id}/unassign`, { method: "PUT" });
          if (res) { setSuccessMsg(`Unassigned ${row.name}`); setTimeout(() => setSuccessMsg(""), 3000); }
          load();
        }} style={{ background: "#64748b", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", minWidth: "90px", textAlign: "center", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.8"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>
          Unassign
        </button>
      )}
      {(session.role === "SUPER_ADMIN" || (session.role === "ADMIN" && row.createdByEmail === session.email)) && (
        <button onClick={async () => {
          const res = await api(`/users/${row.id}`, { method: "DELETE" });
          if (res && res.message) { setSuccessMsg(res.message); setTimeout(() => setSuccessMsg(""), 3000); }
          load();
        }} style={{ background: "transparent", color: "#e11d48", padding: "4px", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
          <Trash2 size={16} />
        </button>
      )}
    </>
  )};

  return (
    <section className="split">
      <form className="entity-form" onSubmit={saveForm}>
        <h2>{form.id ? "Edit User" : "Add User"}</h2>
        {errMsg && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", fontWeight: "bold", padding: "8px", background: "#fef2f2", borderRadius: "4px", border: "1px solid #f87171" }}>{errMsg}</div>}

        <label>Name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          {isNameTaken && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: "bold" }}>Username already exists</span>}
          {showNameAvail && <span style={{ color: "#10b981", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: "bold", transition: "opacity 0.3s" }}>Username is available</span>}
        </label>

        <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>

        <label>
          Password {form.id && <span style={{fontSize: '11px', color: '#64748b'}}>(Leave blank to keep current)</span>}
          <input type="password" value={form.password || ""} placeholder={form.id ? "••••••••" : ""} onChange={e => setForm({ ...form, password: e.target.value })} required={!form.id} />
        </label>

        <label>Role</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          {roles.filter(r => session?.role === "SUPER_ADMIN" || r === "USER").map(r => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: form.role === r ? "2px solid #146c72" : "1px solid #cfd8e3",
                background: form.role === r ? "#eef2f6" : "white",
                color: form.role === r ? "#146c72" : "#526071",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <span style={{ flex: 1 }}>Account Status</span>
          <button
            type="button"
            onClick={() => setForm({ ...form, active: !form.active })}
            style={{
              width: "44px", height: "24px", borderRadius: "12px", border: "none", position: "relative",
              background: form.active ? "#10b981" : "#cfd8e3", cursor: "pointer", transition: "0.3s"
            }}
          >
            <div style={{
              width: "20px", height: "20px", background: "white", borderRadius: "50%",
              position: "absolute", top: "2px", left: form.active ? "22px" : "2px", transition: "0.3s"
            }} />
          </button>
          <span style={{ fontSize: "12px", color: form.active ? "#10b981" : "#64748b", fontWeight: "bold", minWidth: "50px" }}>
            {form.active ? "Active" : "Inactive"}
          </span>
        </label>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button className="primary" style={{ flex: 1 }}><Save size={16} /> Save</button>
          {form.id && <button type="button" onClick={() => setForm(empty)} style={{ background: "transparent", color: "var(--text-light)" }}>Cancel</button>}
        </div>
      </form>

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>User Role Management</h2>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          {session.role === "SUPER_ADMIN" ? (
            <>
              <button onClick={() => setActiveUserTab("ADMINS")} style={{ padding: "8px 16px", borderRadius: "6px", border: activeUserTab === "ADMINS" ? "2px solid #146c72" : "1px solid #cfd8e3", background: activeUserTab === "ADMINS" ? "#eef2f6" : "white", color: activeUserTab === "ADMINS" ? "#146c72" : "#526071", fontWeight: "bold", cursor: "pointer" }}>Branch Managers</button>
              <button onClick={() => setActiveUserTab("USERS")} style={{ padding: "8px 16px", borderRadius: "6px", border: activeUserTab === "USERS" ? "2px solid #146c72" : "1px solid #cfd8e3", background: activeUserTab === "USERS" ? "#eef2f6" : "white", color: activeUserTab === "USERS" ? "#146c72" : "#526071", fontWeight: "bold", cursor: "pointer" }}>GROs</button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveUserTab("MY_USERS")} style={{ padding: "8px 16px", borderRadius: "6px", border: activeUserTab === "MY_USERS" ? "2px solid #146c72" : "1px solid #cfd8e3", background: activeUserTab === "MY_USERS" ? "#eef2f6" : "white", color: activeUserTab === "MY_USERS" ? "#146c72" : "#526071", fontWeight: "bold", cursor: "pointer" }}>GROs Assigned to Me</button>
              <button onClick={() => setActiveUserTab("AVAILABLE_USERS")} style={{ padding: "8px 16px", borderRadius: "6px", border: activeUserTab === "AVAILABLE_USERS" ? "2px solid #146c72" : "1px solid #cfd8e3", background: activeUserTab === "AVAILABLE_USERS" ? "#eef2f6" : "white", color: activeUserTab === "AVAILABLE_USERS" ? "#146c72" : "#526071", fontWeight: "bold", cursor: "pointer" }}>Available GROs</button>
            </>
          )}
        </div>
        {successMsg && <div className="success" style={{ padding: "1rem", background: "var(--surface)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>{successMsg}</div>}
        <Table
          rows={items.filter(u => session.role === "SUPER_ADMIN" ? (activeUserTab === "ADMINS" ? u.role === "ADMIN" : u.role === "USER") : (activeUserTab === "MY_USERS" ? u.assignedAdminName === session.name : u.assignedAdminName !== session.name))}
          columns={["name", "email", "role", "active", "assignedAdminName"]}
          renderCell={renderCell}
          onEdit={(row) => setForm(row)}
          customAction={actionCell}
        />
      </div>
    </section>
  );
}

function AuditTrail({ session }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    Promise.all([api("/audits").catch(() => []), session.role === "ADMIN" ? api("/users").catch(() => []) : Promise.resolve([])]).then(([data, users]) => {
      setItems(applyVisibility(data, "audits", session, users));
    });
  }, [session]);
  const renderCell = (row, col) => {
    if (col === "status") {
      const clsName = `status-${row.status.toLowerCase()}`;
      return (
        <span className={`status-badge ${clsName}`}>
          <div className="status-dot"></div>
          {row.status.replace("_", " ")}
        </span>
      );
    }
    if (col === "customerName") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="user-avatar" style={{ background: "#f0fdf4", color: "#166534" }}>{getInitials(row.customerName)}</div>
          <span style={{ fontWeight: 600 }}>{row.customerName}</span>
        </div>
      );
    }
    if (col === "actorEmail") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="user-avatar" style={{ background: "#fdf4ff", color: "#86198f" }}>{getInitials(row.actorEmail)}</div>
          <span style={{ fontWeight: 600 }}>{row.actorEmail}</span>
        </div>
      );
    }
    if (col === "action") {
      return <span className="status-badge status-medium"><div className="status-dot"></div>{row.action}</span>;
    }
    return String(row[col] ?? "");
  };

  return <Table rows={items} columns={["createdAt", "actorEmail", "entityType", "entityId", "action", "oldValue", "newValue", "ipAddress"]} renderCell={renderCell} />;
}

function EntityForm({ title, form, setForm, onSubmit, fields }) {
  return (
    <form className="entity-form" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {fields.map((field) => <label key={field}>{label(field)}<input value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={["name"].includes(field)} /></label>)}
      <button className="primary"><Save size={16} /> Save</button>
    </form>
  );
}

function Table({ rows, columns, onEdit, onDelete, renderCell, customAction, emptyMessage = "No records yet" }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((col) => <th key={col}>{label(col)}</th>)}{(onEdit || onDelete || customAction) && <th></th>}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => {
                let cellVal = renderCell ? renderCell(row, col) : String(row[col] ?? "");
                if (col === "role" && (row[col] === "SUPER_ADMIN" || row[col] === "ADMIN" || row[col] === "USER")) {
                  cellVal = { SUPER_ADMIN: "CEO", ADMIN: "Branch Manager", USER: "GRO" }[row[col]];
                }
                return <td key={col}>{cellVal}</td>;
              })}
              {(onEdit || onDelete || customAction) && <td className="actions">
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", justifyContent: "flex-end" }}>
                  {onEdit && <button onClick={() => onEdit(row)} title="Update" style={{ padding: "8px 16px", background: "#146c72", color: "white", borderRadius: "6px", border: "none", fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", minWidth: "90px", textAlign: "center", cursor: "pointer", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.8"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>Update</button>}
                  {onDelete && <button onClick={() => onDelete(row)} title="Delete" style={{ background: "transparent", color: "#e11d48", padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}><Trash2 size={18} /></button>}
                  {customAction && customAction(row)}
                </div>
              </td>}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={columns.length + 1} className="empty">{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function label(value) {
  if (value === "gro" || value === "groEmail") return "GRO";
  if (value === "admin" || value === "adminEmail") return "Branch Manager";
  if (value === "assignedAdminName") return "Assigned Branch Manager";
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

createRoot(document.getElementById("root")).render(<App />);
