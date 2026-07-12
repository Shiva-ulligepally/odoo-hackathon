"""
EcoSphere AI - Knowledge Graph Engine (Module 7 / Step 4)
Builds a NetworkX directed graph of ESG entity relationships from MongoDB.
Supports AI reasoning over: Organization → Departments → Employees →
Assets → Carbon Sources → Bills → Policies → CSR Activities →
Recommendations → Reports.
"""
import logging
from typing import Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

# Singleton graph instance
_graph = None


def _get_graph():
    global _graph
    if _graph is None:
        try:
            import networkx as nx
            _graph = nx.DiGraph()
            logger.info("NetworkX Knowledge Graph initialized")
        except ImportError:
            logger.error("NetworkX not installed")
    return _graph


def build_graph_for_organization(organization_id: str) -> dict:
    """
    Build/update the knowledge graph from MongoDB data for a given organization.
    Returns a summary of the graph structure.
    """
    logger.info(f"Building Knowledge Graph for org: {organization_id}")
    G = _get_graph()
    if G is None:
        return {"error": "NetworkX unavailable", "nodes": 0, "edges": 0}

    try:
        from database import get_collection
        from bson import ObjectId

        org_oid = ObjectId(organization_id)

        # ── Organization Node ──────────────────────────────────────────────
        org_col = get_collection("organizations")
        org = org_col.find_one({"_id": org_oid}) if org_col else None
        org_node = f"org:{organization_id}"
        if org:
            G.add_node(org_node, type="Organization", name=org.get("name", "Unknown"),
                       industry=org.get("industry", ""), label=f"Org: {org.get('name', '')}")

        # ── Departments ────────────────────────────────────────────────────
        dept_col = get_collection("departments")
        if dept_col:
            depts = list(dept_col.find({"organization": org_oid}))
            for dept in depts:
                node = f"dept:{dept['_id']}"
                G.add_node(node, type="Department", name=dept.get("name", "Unknown"),
                           label=f"Dept: {dept.get('name', '')}")
                G.add_edge(org_node, node, relation="HAS_DEPARTMENT")

        # ── Employees ──────────────────────────────────────────────────────
        emp_col = get_collection("employees")
        if emp_col:
            emps = list(emp_col.find({"organization": org_oid}))
            for emp in emps:
                node = f"emp:{emp['_id']}"
                G.add_node(node, type="Employee", name=emp.get("name", ""),
                           role=emp.get("role", ""), label=f"Emp: {emp.get('name', '')}")
                dept_node = f"dept:{emp.get('department', '')}"
                if G.has_node(dept_node):
                    G.add_edge(dept_node, node, relation="HAS_EMPLOYEE")
                else:
                    G.add_edge(org_node, node, relation="HAS_EMPLOYEE")

        # ── Carbon Records ─────────────────────────────────────────────────
        carbon_col = get_collection("carbonrecords")
        if carbon_col:
            records = list(carbon_col.find({"organization": org_oid}))
            for rec in records:
                node = f"carbon:{rec['_id']}"
                G.add_node(node, type="CarbonRecord", scope=rec.get("scope", ""),
                           value=rec.get("value", 0), activity=rec.get("activityType", ""),
                           label=f"Carbon: {rec.get('scope', '')} {rec.get('value', 0)} MT")
                dept_node = f"dept:{rec.get('department', '')}"
                source = dept_node if G.has_node(dept_node) else org_node
                G.add_edge(source, node, relation="EMITS")

        # ── Energy Bills ───────────────────────────────────────────────────
        bill_col = get_collection("energybills")
        if bill_col:
            bills = list(bill_col.find({"organization": org_oid}))
            for bill in bills:
                node = f"bill:{bill['_id']}"
                G.add_node(node, type="EnergyBill", utility=bill.get("utilityType", ""),
                           consumption=bill.get("consumption", 0), unit=bill.get("unit", ""),
                           label=f"Bill: {bill.get('utilityType', '')} {bill.get('consumption', 0)}")
                dept_node = f"dept:{bill.get('department', '')}"
                source = dept_node if G.has_node(dept_node) else org_node
                G.add_edge(source, node, relation="CONSUMES")

        # ── Policies ───────────────────────────────────────────────────────
        policy_col = get_collection("policies")
        if policy_col:
            policies = list(policy_col.find({"organization": org_oid}))
            for pol in policies:
                node = f"policy:{pol['_id']}"
                G.add_node(node, type="Policy", title=pol.get("title", ""),
                           status=pol.get("status", "Draft"), label=f"Policy: {pol.get('title', '')}")
                G.add_edge(org_node, node, relation="GOVERNS")

        # ── CSR Activities ─────────────────────────────────────────────────
        csr_col = get_collection("csractivities")
        if csr_col:
            activities = list(csr_col.find({"organization": org_oid}))
            for act in activities:
                node = f"csr:{act['_id']}"
                G.add_node(node, type="CSRActivity", title=act.get("title", ""),
                           status=act.get("status", ""), budget=act.get("budget", 0),
                           label=f"CSR: {act.get('title', '')}")
                G.add_edge(org_node, node, relation="CONDUCTS")

        # ── Uploaded Documents ─────────────────────────────────────────────
        doc_col = get_collection("uploadeddocuments")
        if doc_col:
            docs = list(doc_col.find({"organization": org_oid}))
            for doc in docs:
                node = f"doc:{doc['_id']}"
                G.add_node(node, type="Document", name=doc.get("name", ""),
                           fileType=doc.get("fileType", ""), label=f"Doc: {doc.get('name', '')}")
                G.add_edge(org_node, node, relation="HAS_DOCUMENT")

        # ── AI Recommendations ─────────────────────────────────────────────
        rec_col = get_collection("airecommendations")
        if rec_col:
            recs = list(rec_col.find({"organization": org_oid}))
            for rec in recs:
                node = f"rec:{rec['_id']}"
                G.add_node(node, type="AIRecommendation",
                           title=rec.get("title", ""), priority=rec.get("status", "New"),
                           label=f"Rec: {rec.get('title', '')[:40]}")
                G.add_edge(org_node, node, relation="HAS_RECOMMENDATION")

        node_count = G.number_of_nodes()
        edge_count = G.number_of_edges()
        logger.info(f"Knowledge Graph built: {node_count} nodes, {edge_count} edges")

        return {
            "nodes": node_count,
            "edges": edge_count,
            "node_types": _count_node_types(G),
            "organization": org.get("name", organization_id) if org else organization_id,
            "built_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Knowledge Graph build failed: {e}")
        return {"error": str(e), "nodes": 0, "edges": 0}


def _count_node_types(G) -> dict:
    """Count nodes by type for summary."""
    counts = {}
    for _, data in G.nodes(data=True):
        node_type = data.get("type", "Unknown")
        counts[node_type] = counts.get(node_type, 0) + 1
    return counts


def query_relationships(organization_id: str, entity_type: str = None) -> List[dict]:
    """
    Query the graph for relationships. Returns list of edge triples.
    """
    G = _get_graph()
    if G is None:
        return []

    results = []
    for u, v, data in G.edges(data=True):
        # Filter by org prefix
        if not u.startswith(f"org:{organization_id}") and not v.startswith(f"org:{organization_id}"):
            if organization_id not in u and organization_id not in v:
                continue
        u_data = G.nodes.get(u, {})
        v_data = G.nodes.get(v, {})
        if entity_type and u_data.get("type") != entity_type and v_data.get("type") != entity_type:
            continue
        results.append({
            "from": u_data.get("label", u),
            "from_type": u_data.get("type", "Unknown"),
            "relation": data.get("relation", "RELATED_TO"),
            "to": v_data.get("label", v),
            "to_type": v_data.get("type", "Unknown")
        })
    return results[:100]  # Cap for performance


def get_carbon_chain(organization_id: str) -> dict:
    """Get the full carbon emission chain: org → dept → carbon records."""
    G = _get_graph()
    if G is None:
        return {}

    chain = {"organization": organization_id, "departments": []}
    org_node = f"org:{organization_id}"

    if not G.has_node(org_node):
        return chain

    for neighbor in G.successors(org_node):
        if G.nodes[neighbor].get("type") == "Department":
            dept_data = G.nodes[neighbor]
            dept_entry = {"name": dept_data.get("name"), "emissions": []}
            for carbon_node in G.successors(neighbor):
                if G.nodes[carbon_node].get("type") == "CarbonRecord":
                    dept_entry["emissions"].append(G.nodes[carbon_node])
            chain["departments"].append(dept_entry)

    return chain


def export_graph_summary(organization_id: str) -> dict:
    """Export a serializable graph summary for the API response."""
    G = _get_graph()
    if G is None:
        return {"nodes": [], "edges": []}

    nodes = [
        {"id": n, **{k: str(v) for k, v in data.items()}}
        for n, data in G.nodes(data=True)
        if organization_id in n or True  # Include all for now
    ][:200]

    edges = [
        {"source": u, "target": v, "relation": data.get("relation", "")}
        for u, v, data in G.edges(data=True)
    ][:300]

    return {"nodes": nodes, "edges": edges}
