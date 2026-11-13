"""
recommender.py: the "chef" of Rajasthan College Compass.

This is a Python version of js/recommender.js. Same rules, same numbers,
so your website shows the same results whether it uses the JS or the API.

Pipeline for /recommend:
  1. filter  -> drop colleges the student can't realistically get into
  2. score   -> give each college 0-100 for fees, placements, location, reputation
  3. weight  -> mix those scores using the student's 4 sliders
  4. rank    -> sort by final Match Score
"""
import json
import math
import re
from pathlib import Path

# ---------------------------------------------------------------------------
# 0. Load the data once, when the server starts
# ---------------------------------------------------------------------------
DATA_FILE = Path(__file__).parent / "data.json"   # always next to this file
with open(DATA_FILE, encoding="utf-8") as f:
    DATA = json.load(f)

COLLEGES = DATA["colleges"]
CUTOFFS = DATA["cutoffs"]
PLACEMENTS = DATA["placements"]
SCHOLARSHIPS = DATA["scholarships"]

# True  = score NIRF bands exactly like the old JS did (for testing only)
# False = improved scoring (handles "Top 30", "101-150", "201-300")
USE_LEGACY_NIRF = False


# ---------------------------------------------------------------------------
# Small helpers (JavaScript and Python format numbers differently)
# ---------------------------------------------------------------------------
def num(x):
    """Safe number: '' or None or text -> 0."""
    try:
        v = float(x)
        return 0 if math.isnan(v) else v
    except (TypeError, ValueError):
        return 0


def js_round(x):
    """JS rounds .5 up; Python rounds .5 to the nearest even. Match JS."""
    return int(math.floor(x + 0.5))


def js_str(x):
    """12.0 -> '12', 18.5 -> '18.5' (like JavaScript)."""
    x = num(x)
    return str(int(x)) if float(x).is_integer() else str(x)


def inr(n):
    """Indian digit grouping: 1234567 -> '12,34,567'."""
    n = int(round(num(n)))
    s = str(abs(n))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts) + "," + tail
    return ("-" if n < 0 else "") + s


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


# ---------------------------------------------------------------------------
# 1. Admission chance: Safe / Target / Reach
# ---------------------------------------------------------------------------
def assess_chance_tag(rank_or_score, closing_value, is_bitsat):
    """
    RANK exams (lower is better):  ratio = your rank / closing rank
        <= 0.80 Safe | <= 1.10 Target | <= 1.30 Reach | else None
    SCORE exam (BITSAT, higher is better): the logic is flipped.
    """
    if not rank_or_score or not closing_value or closing_value <= 0:
        return None

    if is_bitsat:
        if rank_or_score >= closing_value + 15 or rank_or_score >= 1.05 * closing_value:
            return "Safe"
        if rank_or_score >= closing_value - 15 or rank_or_score >= 0.95 * closing_value:
            return "Target"
        if rank_or_score >= closing_value - 30 or rank_or_score >= 0.90 * closing_value:
            return "Reach"
        return None

    ratio = rank_or_score / closing_value
    if ratio <= 0.80:
        return "Safe"
    if ratio <= 1.10:
        return "Target"
    if ratio <= 1.30:
        return "Reach"
    return None


def evaluate_college_cutoffs(college_id, exam, rank_or_score, category,
                             domicile, preferred_branches, is_bitsat):
    """Look at this college's cutoff rows and find which branches are possible."""
    rows = [r for r in CUTOFFS if r["College ID"] == college_id and r["Exam"] == exam]
    if not rows:
        return []

    is_home = "Home State" in domicile or "Rajasthan" in domicile
    quota_priority = (
        ["Home State", "All India", "Not applicable", "Other State"] if is_home
        else ["Other State", "All India", "Not applicable", "Home State"]
    )

    if preferred_branches:
        target_branches = preferred_branches
    else:
        target_branches = list(dict.fromkeys(r["Branch"] for r in rows))  # unique, in order

    matched = []
    for branch in target_branches:
        branch_rows = [r for r in rows if r["Branch"] == branch]
        if not branch_rows:
            continue

        latest_year = max(num(r["Year"]) for r in branch_rows)
        year_rows = [r for r in branch_rows if num(r["Year"]) == latest_year]

        chosen = None
        for q in quota_priority:
            quota_rows = [r for r in year_rows if r["Quota"] == q]
            if quota_rows:
                chosen = (
                    next((r for r in quota_rows if r["Category"] == category), None)
                    or next((r for r in quota_rows if r["Category"] == "Open (Gen)"), None)
                    or quota_rows[0]
                )
                break

        if not chosen:
            chosen = next((r for r in year_rows if r["Category"] == category), None) or year_rows[0]

        closing = num(chosen["Closing Value"])
        chance = assess_chance_tag(rank_or_score, closing, is_bitsat)
        if chance:
            matched.append({
                "branch": branch,
                "year": chosen["Year"],
                "quota": chosen["Quota"],
                "category": chosen["Category"],
                "closingValue": closing,
                "valueType": chosen["Value Type"],
                "chance": chance,
            })
    return matched


def get_best_branch_fit(matched):
    order = {"Safe": 1, "Target": 2, "Reach": 3}
    return sorted(matched, key=lambda m: order.get(m["chance"], 99))[0]


# ---------------------------------------------------------------------------
# 2. The four 0-100 scores
# ---------------------------------------------------------------------------
def get_latest_placements(college_id):
    rows = [p for p in PLACEMENTS if p["College ID"] == college_id]
    if not rows:
        return None
    rows.sort(key=lambda p: -num(p["Year"]))
    return rows[0]


def calc_fees_score(cost, min_cost, max_cost):
    if max_cost <= min_cost:
        return 80
    normalized = 100 - ((cost - min_cost) / (max_cost - min_cost)) * 80
    return js_round(clamp(normalized, 15, 100))


def calc_placements_score(college_id):
    stats = get_latest_placements(college_id)
    if not stats:
        return 50
    avg = num(stats["Avg Package (LPA)"])
    median = num(stats["Median Package (LPA)"])
    pct = num(stats["Placement %"])
    avg_score = min(100, avg / 28 * 100)
    median_score = min(100, median / 24 * 100)
    pct_score = min(100, pct)
    composite = 0.45 * avg_score + 0.35 * median_score + 0.20 * pct_score
    return js_round(clamp(composite, 10, 100))


def calc_location_score(distance_km, max_dist):
    return js_round(clamp(100 - (distance_km / max_dist) * 80, 20, 100))


def nirf_score(band):
    """Turn a NIRF band like 'Top 60' or '151-200' into a 0-100 score."""
    b = (band or "").lower()
    if USE_LEGACY_NIRF:                       # old JS rules (for parity tests)
        if "top 60" in b: return 100
        if "top 100" in b: return 85
        if "top 150" in b: return 70
        if "151-200" in b: return 55
        return 40
    m = re.match(r"top\s*(\d+)", b)
    if m:
        n = int(m.group(1))
        return 100 if n <= 60 else 85 if n <= 100 else 70 if n <= 150 else 55
    m = re.match(r"(\d+)\s*-\s*(\d+)", b)
    if m:
        hi = int(m.group(2))
        return 85 if hi <= 100 else 70 if hi <= 150 else 55 if hi <= 200 else 45 if hi <= 300 else 40
    return 40                                  # 'Not ranked' or empty


def calc_reputation_score(college):
    """NAAC 40% + NBA 20% + NIRF 40%."""
    naac = (college.get("NAAC Grade") or "").upper()
    naac_score = 40
    if "A++" in naac: naac_score = 100
    elif "A+" in naac: naac_score = 90
    elif "A" in naac: naac_score = 80
    elif "B++" in naac: naac_score = 70
    elif "B+" in naac: naac_score = 60
    elif "B" in naac: naac_score = 50

    nba = (college.get("NBA Accredited") or "").lower()
    nba_score = 95 if "yes" in nba else 40

    total = 0.40 * naac_score + 0.20 * nba_score + 0.40 * nirf_score(college.get("NIRF Engineering Band"))
    return js_round(clamp(total, 20, 100))


def calculate_weighted_match_score(scores, priorities):
    """Mix the 4 scores using the student's slider weights (0-10 each)."""
    w_fees = num(priorities.get("fees"))
    w_plc = num(priorities.get("placements"))
    w_loc = num(priorities.get("location"))
    w_rep = num(priorities.get("reputation"))
    total_w = w_fees + w_plc + w_loc + w_rep

    if total_w == 0:
        avg = (scores["feesScore"] + scores["placementsScore"]
               + scores["locationScore"] + scores["reputationScore"]) / 4
        return js_round(avg)

    weighted = (scores["feesScore"] * w_fees + scores["placementsScore"] * w_plc
                + scores["locationScore"] * w_loc + scores["reputationScore"] * w_rep)
    return js_round(clamp(weighted / total_w, 10, 100))


# ---------------------------------------------------------------------------
# 3. Words shown to the student
# ---------------------------------------------------------------------------
def generate_fit_reason(college, priorities, placements, total_cost):
    dist = num(college.get("Distance from Jaipur (km, approx)"))
    avg_pkg = num(placements["Avg Package (LPA)"]) if placements else 0
    naac = college.get("NAAC Grade")

    # which slider did the student rate highest? (ties: fees > placements > location > reputation)
    entries = sorted(priorities.items(), key=lambda kv: -num(kv[1]))
    top = entries[0][0]

    if top == "placements" and avg_pkg >= 12:
        return (f"Outstanding placement record featuring an average package of {js_str(avg_pkg)} LPA "
                f"and strong campus recruitment align directly with your high career focus.")
    if top == "fees" and total_cost < 150000:
        return (f"Very affordable annual expenditure of approximately ₹{inr(total_cost)}, "
                f"making it an ideal high-ROI option for your fee priority.")
    if top == "location" and dist <= 25:
        return (f"Prime location situated right in Jaipur city ({js_str(dist)} km), minimizing travel "
                f"and giving direct access to Rajasthan's premier tech ecosystem.")
    if top == "reputation" and (college.get("NIRF Engineering Band") or naac in ("A++", "A+")):
        return (f"Prestigious national standing with NAAC Grade {naac or 'A'} and recognized NIRF "
                f"recognition, meeting your preference for academic brand value.")

    pkg_text = f"{js_str(avg_pkg)} LPA average package" if avg_pkg else "good campus placements"
    return f"Balanced overall match offering reliable academic quality, {pkg_text}, and strong alumni connection across Rajasthan."


def generate_choose_when(college):
    ctype = college.get("Type")
    name = college.get("College Name", "")
    if "MNIT" in name or "IIT" in name:
        return "Choose it when you want Tier-1 national institute prestige, peer network, and top core/tech campus placements."
    if "BITS" in name:
        return "Choose it when you desire a world-class private university with zero attendance policy, elite alumni, and top international opportunities."
    if ctype == "Govt":
        return "Choose it when keeping your education cost low with high ROI and university campus independence is your primary goal."
    if "Banasthali" in name:
        return "Choose it when seeking a holistic, women-centric educational environment with strong residential campus culture."
    if ctype == "Deemed" or "LNMIIT" in name or "Manipal" in name:
        return "Choose it when you want modern infrastructure, industry-focused coding culture, and modern campus amenities."
    return "Choose it when you want a disciplined engineering college in Rajasthan with good local industry placement support."


def check_scholarship_eligibility(college_id, category, family_income):
    """Biggest yearly scholarship amount the student may qualify for."""
    max_amount = 0
    for s in SCHOLARSHIPS:
        if s["College ID"] != "ALL" and s["College ID"] != college_id:
            continue

        elig = s.get("Eligible Category") or "All"
        cat_match = (
            elig == "All" or category in elig
            or ("SC" in elig and category == "SC")
            or ("ST" in elig and category == "ST")
            or ("OBC" in elig and category == "OBC-NCL")
            or ("EWS" in elig and category == "EWS")
        )
        if not cat_match:
            continue

        if family_income not in (None, ""):
            limit = num(s.get("Income Limit (INR/yr)"))
            if limit and num(family_income) > limit:
                continue

        amount = num(s.get("Benefit Amount (INR/yr)"))
        if amount > max_amount:
            max_amount = amount
    return max_amount


def get_data_confidence(data_status):
    if data_status == "MOCK" or not data_status:
        return {"label": "Demo data", "class": "badge-mock",
                "tooltip": "Synthetic mock dataset for UI demonstration"}
    return {"label": "Verified Data", "class": "badge-safe",
            "tooltip": "Sourced from official counseling bulletins"}


# ---------------------------------------------------------------------------
# 4. THE MAIN PIPELINE: /recommend calls this
# ---------------------------------------------------------------------------
def recommend(profile):
    exam = profile.get("exam")
    rank_or_score = num(profile.get("rankOrScore"))
    category = profile.get("category") or "Open (Gen)"
    domicile = profile.get("domicile") or "Rajasthan (Home State)"
    gender = profile.get("gender") or "Male"
    preferred = profile.get("preferredBranches") or []
    family_income = profile.get("familyIncome")
    priorities = profile.get("priorities") or {"fees": 5, "placements": 5, "location": 5, "reputation": 5}
    need_hostel = bool(profile.get("needHostel"))

    is_bitsat = exam == "BITSAT"
    is_female = gender == "Female"

    # bounds used to turn fees / distance into 0-100 scores
    costs = [num(c["Annual Tuition (INR)"]) + (num(c["Hostel Fee / Year (INR)"]) if need_hostel else 0)
             for c in COLLEGES]
    min_cost, max_cost = min(costs), max(costs)
    max_dist = max(num(c["Distance from Jaipur (km, approx)"]) for c in COLLEGES) or 350

    results = []
    for college in COLLEGES:
        cid = college["College ID"]

        # Rule A: women-only college
        if college.get("Gender Eligibility") == "Women only" and not is_female:
            continue

        # Rule B: any branch with a realistic chance?
        matched = evaluate_college_cutoffs(cid, exam, rank_or_score, category,
                                           domicile, preferred, is_bitsat)
        if not matched:
            continue
        best = get_best_branch_fit(matched)

        # Rule C: four component scores
        tuition = num(college["Annual Tuition (INR)"])
        hostel = num(college["Hostel Fee / Year (INR)"])
        total_cost = tuition + (hostel if need_hostel else 0)
        dist = num(college["Distance from Jaipur (km, approx)"])

        scores = {
            "feesScore": calc_fees_score(total_cost, min_cost, max_cost),
            "placementsScore": calc_placements_score(cid),
            "locationScore": calc_location_score(dist, max_dist),
            "reputationScore": calc_reputation_score(college),
        }

        # Rule D: weighted match score
        match_score = calculate_weighted_match_score(scores, priorities)
        placement_stats = get_latest_placements(cid)

        results.append({
            "college": college,
            "collegeId": cid,
            "collegeName": college["College Name"],
            "city": college["City"],
            "type": college["Type"],
            "totalAnnualCost": total_cost,
            "annualTuition": tuition,
            "annualHostel": hostel,
            "distanceFromJaipur": dist,
            "bestChance": best["chance"],
            "bestBranchName": best["branch"],
            "bestClosingValue": best["closingValue"],
            "matchedBranches": matched,
            "matchScore": match_score,
            "componentScores": scores,
            "placementStats": placement_stats,
            "fitReason": generate_fit_reason(college, priorities, placement_stats, total_cost),
            "chooseWhen": generate_choose_when(college),
            "maxScholarship": check_scholarship_eligibility(cid, category, family_income),
            "confidenceBadge": get_data_confidence(college.get("Data Status")),
            "naac": college.get("NAAC Grade") or "Not Accredited",
            "nba": college.get("NBA Accredited") or "No",
            "nirf": college.get("NIRF Engineering Band") or "Not Ranked",
        })

    results.sort(key=lambda r: -r["matchScore"])   # best first (stable sort)
    return results


# ---------------------------------------------------------------------------
# 4b. Small helpers for the website's dropdowns and home-page numbers
# ---------------------------------------------------------------------------
def get_branches():
    """Every branch that exists in the cutoff data, most widely offered first."""
    offered_by = {}
    for row in CUTOFFS:
        offered_by.setdefault(row["Branch"], set()).add(row["College ID"])
    return sorted(offered_by, key=lambda b: -len(offered_by[b]))   # stable: ties keep data order


def get_stats():
    """Real counts for the home page (instead of typed-in numbers)."""
    return {
        "colleges": len(COLLEGES),
        "cutoffs": len(CUTOFFS),
        "placements": len(PLACEMENTS),
        "scholarships": len(SCHOLARSHIPS),
        "branches": len({r["Branch"] for r in CUTOFFS}),
        "exams": sorted({r["Exam"] for r in CUTOFFS}),
    }


# ---------------------------------------------------------------------------
# 5. Compare two colleges / Branch vs College
# ---------------------------------------------------------------------------
def _is_top_nirf(band):
    m = re.match(r"top\s*(\d+)", (band or "").lower())
    if USE_LEGACY_NIRF:
        return "Top 60" in (band or "")
    return bool(m) and int(m.group(1)) <= 60


def build_compare_college(college_id):
    """Everything compare.html shows for one college."""
    raw = next((c for c in COLLEGES if c["College ID"] == college_id), None)
    if raw is None:
        return None
    tuition = num(raw["Annual Tuition (INR)"])
    hostel = num(raw["Hostel Fee / Year (INR)"])
    return {
        "raw": raw,
        "collegeId": college_id,
        "collegeName": raw["College Name"],
        "city": raw["City"],
        "type": raw["Type"],
        "annualTuition": tuition,
        "annualHostel": hostel,
        "totalAnnualCost": tuition + hostel,
        "placementStats": get_latest_placements(college_id),
        "distanceFromJaipur": num(raw["Distance from Jaipur (km, approx)"]),
        "naac": raw.get("NAAC Grade") or "N/A",
        "nba": raw.get("NBA Accredited") or "No",
        "nirf": raw.get("NIRF Engineering Band") or "Not Ranked",
    }


def compare_pair(a, b):
    """'If you choose A over B: what you gain, what you give up.'"""
    gains, losses = [], []

    fee_diff = abs(a["totalAnnualCost"] - b["totalAnnualCost"])
    if a["totalAnnualCost"] < b["totalAnnualCost"]:
        gains.append(f"Lower annual cost: save approx ₹{inr(fee_diff)}/year compared to {b['collegeName']}.")
    elif a["totalAnnualCost"] > b["totalAnnualCost"]:
        losses.append(f"Higher annual cost: pay approx ₹{inr(fee_diff)}/year more than {b['collegeName']}.")

    pkg_a = num(a["placementStats"]["Avg Package (LPA)"]) if a["placementStats"] else 0
    pkg_b = num(b["placementStats"]["Avg Package (LPA)"]) if b["placementStats"] else 0
    pkg_diff = f"{abs(pkg_a - pkg_b):.1f}"
    if pkg_a > pkg_b + 0.5:
        gains.append(f"Higher average placement package (+{pkg_diff} LPA) with stronger recruiter presence.")
    elif pkg_a < pkg_b - 0.5:
        losses.append(f"Lower average package (-{pkg_diff} LPA) than {b['collegeName']}.")

    da, db = a["distanceFromJaipur"], b["distanceFromJaipur"]
    if da < db:
        gains.append(f"Closer to Jaipur ({js_str(da)} km vs {js_str(db)} km), offering better connectivity and urban opportunities.")
    elif da > db:
        losses.append(f"Further away from Jaipur ({js_str(da)} km vs {js_str(db)} km), requiring longer travel.")

    if _is_top_nirf(a["nirf"]) and not _is_top_nirf(b["nirf"]):
        gains.append(f"Top Tier NIRF standing ({a['nirf']}), enjoying higher national recognition.")
    elif "Top" not in a["nirf"] and "Top" in b["nirf"]:
        losses.append(f"Lower NIRF standing compared to {b['collegeName']} ({b['nirf']}).")

    if not gains:
        gains.append("Comparable academic curriculum and similar campus exposure.")
    if not losses:
        losses.append("No major compromise observed against the compared institution.")
    return {"gains": gains, "losses": losses}


def _is_tech(branch):
    b = branch.lower()
    return "computer" in b or "information" in b or "ai" in b


def evaluate_branch_vs_college(opt_a, opt_b):
    """opt = {'college': row, 'branch': str, 'placementStats': row or None}"""
    tech_a, tech_b = _is_tech(opt_a["branch"]), _is_tech(opt_b["branch"])
    rep_a = calc_reputation_score(opt_a["college"])
    rep_b = calc_reputation_score(opt_b["college"])
    pkg_a = num(opt_a["placementStats"]["Avg Package (LPA)"]) if opt_a["placementStats"] else 0
    pkg_b = num(opt_b["placementStats"]["Avg Package (LPA)"]) if opt_b["placementStats"] else 0
    na, nb = opt_a["college"]["College Name"], opt_b["college"]["College Name"]

    if rep_a > rep_b + 20 and not tech_a and tech_b:
        return (f"Classic dilemma: Option A gives you the prestigious brand of {na} ({rep_a}/100 reputation), "
                f"but Option B gives you high-demand Tech ({opt_b['branch']}) at {nb}. If software/tech roles "
                f"are your absolute passion, choose Option B. If you value peer network, higher education abroad, "
                f"or PSU/consulting roles, Option A's college brand will open bigger doors.")
    if rep_b > rep_a + 20 and tech_a and not tech_b:
        return (f"Option A offers your preferred tech stream ({opt_a['branch']}) at a mid-tier college, while "
                f"Option B provides the elite brand of {nb}. If you are committed to software development, "
                f"Option A will let you code from day one without branch-switch pressure.")
    if pkg_a > pkg_b + 3:
        return (f"Option A strongly outperforms Option B in placement returns ({js_str(pkg_a)} LPA avg vs "
                f"{js_str(pkg_b)} LPA avg) with comparable academic standing. Option A is recommended for "
                f"higher career return on investment.")
    return (f"Both options have balanced merits. Option A ({na} - {opt_a['branch']}) and Option B "
            f"({nb} - {opt_b['branch']}) offer similar career opportunities. Choose based on proximity to "
            f"your hometown and tuition affordability.")