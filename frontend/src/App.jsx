import { useEffect, useMemo, useState } from "react";
import {

  Activity,

  ArrowUpRight,

  Building2,

  CheckCircle2,

  ChevronDown,

  CircleHelp,

  Download,

  LayoutDashboard,

  Search,

  ShieldCheck,

  SlidersHorizontal,

  Target,

  Users,

  XCircle,

} from "lucide-react";

import "./App.css";



const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";



function App() {

  const [leads, setLeads] = useState([]);

  const [qualityLeads, setQualityLeads] = useState([]);

  const [activeTab, setActiveTab] = useState("Overview");

  const [search, setSearch] = useState("");

  const [industry, setIndustry] = useState("All industries");

  const [sortBy, setSortBy] = useState("score");

  const [selectedLead, setSelectedLead] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    async function loadData() {

      try {

        setLoading(true);

        setError("");



        const [scoreResponse, qualityResponse] = await Promise.all([

          fetch(`${API}/leads/score`),

          fetch(`${API}/leads/quality`),

        ]);



        if (!scoreResponse.ok || !qualityResponse.ok) {

          throw new Error("The backend returned an error.");

        }



        const scoreData = await scoreResponse.json();

        const qualityData = await qualityResponse.json();



        setLeads(scoreData.leads);

        setQualityLeads(qualityData.leads);

      } catch {

        setError(

          "Could not connect to the backend. Make sure your server is running on port 5000."

        );

      } finally {

        setLoading(false);

      }

    }



    loadData();

  }, []);



  const qualityMap = useMemo(() => {

    return new Map(qualityLeads.map((lead) => [lead.id, lead]));

  }, [qualityLeads]);



  const industries = [

    "All industries",

    ...new Set(leads.map((lead) => lead.industry)),

  ];



  const filteredLeads = useMemo(() => {

    return leads

      .filter((lead) => {

        const matchesSearch =

          lead.companyName.toLowerCase().includes(search.toLowerCase()) ||

          lead.industry.toLowerCase().includes(search.toLowerCase()) ||

          lead.email.toLowerCase().includes(search.toLowerCase());



        const matchesIndustry =

          industry === "All industries" || lead.industry === industry;



        const quality = qualityMap.get(lead.id);

        const matchesQuality =

          activeTab !== "Quality Center" ||

          (quality && quality.issues.length > 0);



        return matchesSearch && matchesIndustry && matchesQuality;

      })

      .sort((a, b) => {

        if (sortBy === "score") return b.score - a.score;

        if (sortBy === "revenue") return b.revenue - a.revenue;

        return a.companyName.localeCompare(b.companyName);

      });

  }, [leads, qualityMap, search, industry, sortBy, activeTab]);



  const averageScore = leads.length

    ? Math.round(

        leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length

      )

    : 0;



  const duplicateRecords = qualityLeads.filter(

    (lead) => lead.isDuplicate

  ).length;



  const needsReview = qualityLeads.filter(

    (lead) => lead.issues.length > 0

  ).length;



  function exportCSV() {

    const headers = [

      "Company",

      "Industry",

      "Revenue",

      "Employees",

      "Email",

      "Website",

      "Score",

      "Quality Issues",

    ];



    const rows = filteredLeads.map((lead) => {

      const quality = qualityMap.get(lead.id);

      return [

        lead.companyName,

        lead.industry,

        lead.revenue,

        lead.employees,

        lead.email,

        lead.website,

        lead.score,

        quality?.issues.join("; ") || "",

      ];

    });



    const escapeCSV = (value) =>

      `"${String(value ?? "").replace(/"/g, '""')}"`;



    const csv = [headers, ...rows]

      .map((row) => row.map(escapeCSV).join(","))

      .join("\r\n");



    const blob = new Blob(["\uFEFF" + csv], {

      type: "text/csv;charset=utf-8;",

    });



    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "leadpilot-leads.csv";

    link.click();

    URL.revokeObjectURL(url);

  }



  return (

    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">

            <Target size={23} />

          </div>

          <div>

            <h1>LeadPilot</h1>

            <p>LEAD INTELLIGENCE</p>

          </div>

        </div>



        <div className="workspace-label">WORKSPACE</div>



        <nav className="navigation">

          <button

            className={`nav-item ${activeTab === "Overview" ? "active" : ""}`}

            onClick={() => setActiveTab("Overview")}

          >

            <LayoutDashboard size={18} />

            Overview

          </button>



          <button

            className={`nav-item ${activeTab === "Lead Explorer" ? "active" : ""}`}

            onClick={() => setActiveTab("Lead Explorer")}

          >

            <Building2 size={18} />

            Lead Explorer

          </button>



          <button

            className={`nav-item ${activeTab === "Quality Center" ? "active" : ""}`}

            onClick={() => setActiveTab("Quality Center")}

          >

            <ShieldCheck size={18} />

            Quality Center

            {needsReview > 0 && (

              <span className="nav-count">{needsReview}</span>

            )}

          </button>

        </nav>



        <div className="sidebar-bottom">

          <div className="help-card">

            <div className="help-icon">

              <CircleHelp size={18} />

            </div>

            <strong>Need a hand?</strong>

            <p>Explore your leads and understand what makes them a priority.</p>

          </div>



          <div className="profile">

            <div className="avatar">LP</div>

            <div className="profile-info">

              <strong>LeadPilot Demo</strong>

              <span>Workspace admin</span>

            </div>

            <ChevronDown size={16} />

          </div>

        </div>

      </aside>



      <main className="main-content">

        <header className="topbar">

          <div className="breadcrumb">

            Workspace <span>/</span> <strong>{activeTab}</strong>

          </div>

          <div className="topbar-right">

            <span className="live-indicator">

              <span /> Demo data

            </span>

            <div className="top-avatar">LP</div>

          </div>

        </header>



        <div className="page-content">

          <section className="page-heading">

            <div>

              <div className="eyebrow">YOUR SALES WORKSPACE</div>

              <h2>

                {activeTab === "Overview"

                  ? "Lead intelligence, simplified."

                  : activeTab === "Lead Explorer"

                    ? "Explore your leads."

                    : "Keep your data clean."}

              </h2>

              <p>

                {activeTab === "Overview"

                  ? "Know who to prioritize and where your data needs attention."

                  : activeTab === "Lead Explorer"

                    ? "Search, compare, and prioritize potential customers."

                    : "Find duplicate records and fix incomplete lead information."}

              </p>

            </div>



            <button className="primary-button" onClick={exportCSV}>

              <Download size={17} />

              Export CSV

            </button>

          </section>



          {error && (

            <div className="error-banner">

              <XCircle size={19} />

              <span>{error}</span>

            </div>

          )}



          {loading ? (

            <div className="loading-state">

              <div className="spinner" />

              <p>Loading your lead intelligence...</p>

            </div>

          ) : (

            <>

              {activeTab === "Overview" && (

                <section className="metrics-grid">

                  <MetricCard

                    icon={<Users size={19} />}

                    label="Total lead records"

                    value={leads.length}

                    detail="Available in your workspace"

                    color="blue"

                  />

                  <MetricCard

                    icon={<Target size={19} />}

                    label="Average priority"

                    value={`${averageScore}/100`}

                    detail="Based on scoring rules"

                    color="purple"

                  />

                  <MetricCard

                    icon={<ShieldCheck size={19} />}

                    label="Records to review"

                    value={needsReview}

                    detail="Missing or invalid information"

                    color="orange"

                  />

                  <MetricCard

                    icon={<Activity size={19} />}

                    label="Duplicate records"

                    value={duplicateRecords}

                    detail="Company names appearing more than once"

                    color="green"

                  />

                </section>

              )}



              {activeTab === "Overview" && (

                <section className="insight-grid">

                  <div className="panel score-panel">

                    <div className="panel-heading">

                      <div>

                        <h3>Priority distribution</h3>

                        <p>A quick look at your lead scores</p>

                      </div>

                      <Target size={19} />

                    </div>



                    {[

                      {

                        label: "High priority",

                        range: "80–100",

                        count: leads.filter((lead) => lead.score >= 80).length,

                        color: "high",

                      },

                      {

                        label: "Medium priority",

                        range: "50–79",

                        count: leads.filter(

                          (lead) => lead.score >= 50 && lead.score < 80

                        ).length,

                        color: "medium",

                      },

                      {

                        label: "Low priority",

                        range: "0–49",

                        count: leads.filter((lead) => lead.score < 50).length,

                        color: "low",

                      },

                    ].map((item) => (

                      <div className="distribution-row" key={item.label}>

                        <div className="distribution-label">

                          <span className={`legend-dot ${item.color}`} />

                          <span>{item.label}</span>

                          <span className="distribution-range">

                            {item.range}

                          </span>

                        </div>

                        <div className="distribution-track">

                          <div

                            className={`distribution-fill ${item.color}`}

                            style={{

                              width: `${

                                leads.length

                                  ? (item.count / leads.length) * 100

                                  : 0

                              }%`,

                            }}

                          />

                        </div>

                        <strong>{item.count}</strong>

                      </div>

                    ))}



                    <div className="panel-note">

                      Scores use fixed rules, not predicted conversion rates.

                    </div>

                  </div>



                  <div className="panel action-panel">

                    <div className="panel-heading">

                      <div>

                        <h3>Data health</h3>

                        <p>Areas that may need your attention</p>

                      </div>

                      <ShieldCheck size={19} />

                    </div>



                    <div className="health-summary">

                      <div className="health-icon">

                        <ShieldCheck size={24} />

                      </div>

                      <div>

                        <strong>

                          {leads.length - needsReview} clean records

                        </strong>

                        <p>out of {leads.length} total records</p>

                      </div>

                    </div>



                    <div className="health-row">

                      <span>Duplicate company records</span>

                      <strong>{duplicateRecords}</strong>

                    </div>

                    <div className="health-row">

                      <span>Records needing review</span>

                      <strong>{needsReview}</strong>

                    </div>



                    <button

                      className="text-button"

                      onClick={() => setActiveTab("Quality Center")}

                    >

                      Review data quality <ArrowUpRight size={16} />

                    </button>

                  </div>

                </section>

              )}



              <section className="panel table-panel">

                <div className="table-heading">

                  <div>

                    <h3>

                      {activeTab === "Quality Center"

                        ? "Records needing attention"

                        : activeTab === "Lead Explorer"

                          ? "All leads"

                          : "Priority leads"}

                    </h3>

                    <p>

                      {filteredLeads.length} record

                      {filteredLeads.length !== 1 ? "s" : ""} shown

                    </p>

                  </div>

                  <button className="filter-button" onClick={() => {

                    setSearch("");

                    setIndustry("All industries");

                    setSortBy("score");

                  }}>

                    <SlidersHorizontal size={16} />

                    Reset filters

                  </button>

                </div>



                <div className="table-toolbar">

                  <label className="search-box">

                    <Search size={17} />

                    <input

                      type="text"

                      placeholder="Search company, industry or email..."

                      value={search}

                      onChange={(event) => setSearch(event.target.value)}

                    />

                  </label>



                  <select

                    value={industry}

                    onChange={(event) => setIndustry(event.target.value)}

                    aria-label="Filter by industry"

                  >

                    {industries.map((item) => (

                      <option key={item} value={item}>

                        {item}

                      </option>

                    ))}

                  </select>



                  <select

                    value={sortBy}

                    onChange={(event) => setSortBy(event.target.value)}

                    aria-label="Sort leads"

                  >

                    <option value="score">Sort: Priority</option>

                    <option value="revenue">Sort: Revenue</option>

                    <option value="name">Sort: Company name</option>

                  </select>

                </div>



                <div className="table-scroll">

                  <table>

                    <thead>

                      <tr>

                        <th>COMPANY</th>

                        <th>INDUSTRY</th>

                        <th>EST. REVENUE</th>

                        <th>PRIORITY SCORE</th>

                        <th>DATA STATUS</th>

                        <th />

                      </tr>

                    </thead>

                    <tbody>

                      {filteredLeads.map((lead) => {

                        const quality = qualityMap.get(lead.id);

                        const clean = quality?.issues.length === 0;



                        return (

                          <tr key={lead.id}>

                            <td>

                              <div className="company-cell">

                                <div className="company-avatar">

                                  {lead.companyName.charAt(0)}

                                </div>

                                <div>

                                  <strong>{lead.companyName}</strong>

                                  <span>{lead.email || "No email provided"}</span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="industry-pill">

                                {lead.industry}

                              </span>

                            </td>

                            <td className="revenue-cell">

                              ${(lead.revenue / 1000000).toFixed(2)}M

                            </td>

                            <td>

                              <div className="score-cell">

                                <div className="score-track">

                                  <div

                                    className={`score-fill ${

                                      lead.score >= 80

                                        ? "high"

                                        : lead.score >= 50

                                          ? "medium"

                                          : "low"

                                    }`}

                                    style={{ width: `${lead.score}%` }}

                                  />

                                </div>

                                <strong>{lead.score}</strong>

                              </div>

                            </td>

                            <td>

                              <span

                                className={`status-pill ${

                                  clean ? "clean" : "review"

                                }`}

                              >

                                {clean ? (

                                  <CheckCircle2 size={14} />

                                ) : (

                                  <XCircle size={14} />

                                )}

                                {clean ? "Clean" : "Needs review"}

                              </span>

                            </td>

                            <td>

                              <button

                                className="view-button"

                                title="View lead details"

                                onClick={() => setSelectedLead(lead)}

                              >

                                <ArrowUpRight size={17} />

                              </button>

                            </td>

                          </tr>

                        );

                      })}



                      {filteredLeads.length === 0 && (

                        <tr>

                          <td colSpan="6" className="empty-state">

                            No leads match your filters.

                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>



                <div className="table-footer">

                  <span>

                    Showing {filteredLeads.length} of {leads.length} records

                  </span>

                  <span className="footer-source">

                    <span /> Connected to LeadPilot API

                  </span>

                </div>

              </section>

            </>

          )}



          <footer className="page-footer">

            <span>LeadPilot · Lead intelligence workspace</span>

            <span>Demo environment · Sample data</span>

          </footer>

        </div>

      </main>



      {selectedLead && (

        <div className="modal-backdrop" onClick={() => setSelectedLead(null)}>

          <section

            className="lead-modal"

            onClick={(event) => event.stopPropagation()}

          >

            <div className="modal-heading">

              <div>

                <div className="eyebrow">LEAD DETAILS</div>

                <h3>{selectedLead.companyName}</h3>

              </div>

              <button

                className="icon-button"

                onClick={() => setSelectedLead(null)}

                aria-label="Close details"

              >

                <XCircle size={21} />

              </button>

            </div>



            <div className="modal-score">

              <div>

                <span>Priority score</span>

                <strong>{selectedLead.score}/100</strong>

              </div>

              <div className="modal-score-track">

                <div

                  style={{ width: `${selectedLead.score}%` }}

                  className="score-fill high"

                />

              </div>

            </div>



            <div className="detail-list">

              <Detail label="Industry" value={selectedLead.industry} />

              <Detail

                label="Estimated revenue"

                value={`$${selectedLead.revenue.toLocaleString("en-US")}`}

              />

              <Detail

                label="Employees"

                value={selectedLead.employees.toLocaleString("en-US")}

              />

              <Detail

                label="Email"

                value={selectedLead.email || "Not provided"}

              />

              <Detail

                label="Website"

                value={selectedLead.website || "Not provided"}

              />

            </div>



            <h4 className="reason-title">Score breakdown</h4>

<div className="score-breakdown-list">
  {(selectedLead.scoreBreakdown || []).map((item) => (
    <div className="breakdown-item" key={item.category}>
      <div className="breakdown-top">
        <span>{item.category}</span>
        <strong>
          {item.points}/{item.maxPoints}
        </strong>
      </div>

      <div className="breakdown-track">
        <div
          className="breakdown-fill"
          style={{
            width: `${item.maxPoints ? (item.points / item.maxPoints) * 100 : 0}%`,
          }}
        />
      </div>

      <p>{item.reason}</p>
    </div>
  ))}
</div>

<h4 className="reason-title">Data quality checks</h4>

<ul className="reason-list">
  {(qualityMap.get(selectedLead.id)?.issues || []).length > 0 ? (
    qualityMap.get(selectedLead.id).issues.map((issue) => (
      <li key={issue}>
        <XCircle size={16} />
        {issue}
      </li>
    ))
  ) : (
    <li>
      <CheckCircle2 size={16} />
      No issues detected by the current checks.
    </li>
  )}
</ul>

<p className="modal-note">

              This score follows LeadPilot's demo rules. It is not a prediction

              of actual customer conversion.

            </p>

          </section>

        </div>

      )}

    </div>

  );

}



function MetricCard({ icon, label, value, detail, color }) {

  return (

    <article className="metric-card">

      <div className={`metric-icon ${color}`}>{icon}</div>

      <span className="metric-label">{label}</span>

      <strong className="metric-value">{value}</strong>

      <div className="metric-detail">

        <ArrowUpRight size={14} />

        {detail}

      </div>

    </article>

  );

}



function Detail({ label, value }) {

  return (

    <div className="detail-row">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>

  );

}



export default App;
