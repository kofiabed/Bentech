import { useState } from 'react';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([
    { id: "TN-9082", customer: "Kwame A.", location: "Accra Central", status: "In Transit", items: "TechNova ProBook 14 (x1)" },
    { id: "TN-5521", customer: "John D.", location: "Madina", status: "Processing", items: "Ultra-Fast GaN Charger 65W (x1)" }
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, name: "TechNova ProBook 14", stock: 4, location: "Shelf A-3" },
    { id: 2, name: "NovaBuds Wireless ANC", stock: 28, location: "Shelf B-1" },
    { id: 4, name: "Ultra-Fast GaN Charger 65W", stock: 2, location: "Counter Row 2" }
  ]);

  const [tickets, setTickets] = useState([
    { id: 301, customer: "Ama O.", query: "Can I pay with Telecel MoMo on your delivery terminal?", status: "Open" },
    { id: 302, customer: "Kojo M.", query: "Is the 65W charger compatible with older MacBook models?", status: "Pending" }
  ]);

  const updateStock = (id, amount) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item));
  };

  const updateDeliveryStatus = (id, newStatus) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  const resolveTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
    alert(`Support Log: Inquiry ID node [${id}] committed to database history.`);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: 'var(--space-2xl) 0' }}>
      <div className="container-premium">
        
        {/* Portal Header */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
            STAFF OPERATIONS DESK
          </span>
          <h2 style={{ fontSize: '1.8rem', margin: '4px 0 0', letterSpacing: '-0.03em' }}>
            FULFILLMENT & SUPPORT CONSOLE
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Process active delivery pipelines, adjust shelf stocks, and reply to client inquiries.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="staff-layout-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Sidebar Tabs */}
          <aside style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'orders', label: '📦 Orders Pipeline' },
                { id: 'inventory', label: '🔄 Stock Controls' },
                { id: 'inquiries', label: `💬 Help Desk (${tickets.filter(t => t.status !== 'Resolved').length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Core Screen Pane */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px',
            minHeight: '420px'
          }}>
            
            {/* VIEW 1: MANAGE ORDERS */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                  ACTIVE DEPUTY PIPELINES
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '20px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-card-bg)'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Order Ref: {order.id}</strong>
                        <span className="badge-premium badge-success-premium">{order.status}</span>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                        <p><strong>Package Items:</strong> {order.items}</p>
                        <p><strong>Courier Address:</strong> {order.customer} &mdash; {order.location}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {order.status === 'Processing' && (
                          <button onClick={() => updateDeliveryStatus(order.id, 'In Transit')} className="btn btn-primary btn-sm">
                            🚚 DISPATCH TO COURIER
                          </button>
                        )}
                        {order.status === 'In Transit' && (
                          <button onClick={() => updateDeliveryStatus(order.id, 'Delivered')} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--color-success)' }}>
                            🏠 CONFIRM HANDED OVER
                          </button>
                        )}
                        <button onClick={() => alert(`Printing manifest layout block for order: ${order.id}`)} className="btn btn-outline btn-sm">
                          🖨️ PRINT SLIP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 2: INVENTORY CONTROLS */}
            {activeTab === 'inventory' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                  STOCK TELEMETRY CONTROLS
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inventory.map(item => {
                    const isLow = item.stock <= 5;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isLow ? 'rgba(198, 40, 40, 0.02)' : '#ffffff',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', display: 'block' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Warehouse Zone: {item.location}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            onClick={() => updateStock(item.id, -1)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', minWidth: '32px', height: '32px' }}
                          >
                            -
                          </button>
                          <strong style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.95rem', color: isLow ? 'var(--color-error)' : 'inherit' }}>
                            {item.stock}
                          </strong>
                          <button
                            onClick={() => updateStock(item.id, 1)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', minWidth: '32px', height: '32px' }}
                          >
                            +
                          </button>
                          {isLow && (
                            <span style={{ color: 'var(--color-error)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              ⚠️ Low Stock
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: CUSTOMER INQUIRIES */}
            {activeTab === 'inquiries' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                  CUSTOMER SUPPORT QUEUE
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '20px',
                        borderRadius: 'var(--radius-sm)',
                        position: 'relative',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <span className={`badge-premium ${ticket.status === 'Resolved' ? 'badge-success-premium' : 'badge-error-premium'}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
                        {ticket.status}
                      </span>
                      
                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>User Inquiry: {ticket.customer}</strong>
                      
                      <p style={{
                        margin: '8px 0 16px',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-card-bg)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        lineHeight: '1.6',
                        borderLeft: '2px solid var(--color-primary)'
                      }}>
                        "{ticket.query}"
                      </p>

                      {ticket.status !== 'Resolved' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => { const resp = prompt("Enter support reply response payload:"); if (resp) resolveTicket(ticket.id); }}
                            className="btn btn-primary btn-sm"
                          >
                            ✉️ SEND RESPONSE
                          </button>
                          <button
                            onClick={() => resolveTicket(ticket.id)}
                            className="btn btn-outline btn-sm"
                          >
                            ✓ CLOSE INQUIRY
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .staff-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}