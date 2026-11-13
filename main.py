"""
main.py: the API (the "waiter + menu") of Rajasthan College Compass.

It only decides WHICH address does WHAT.
The real thinking lives in recommender.py (the chef).

Run it:   uvicorn main:app --reload
Test it:  http://127.0.0.1:8000/docs
"""
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import recommender as rec

app = FastAPI(title="Rajasthan College Compass API", version="1.0")

# Lets your website (a different address) talk to this server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Shapes of the data the website SENDS us (FastAPI checks these automatically)
# ---------------------------------------------------------------------------
class Priorities(BaseModel):
    fees: float = Field(5, ge=0, le=10)
    placements: float = Field(5, ge=0, le=10)
    location: float = Field(5, ge=0, le=10)
    reputation: float = Field(5, ge=0, le=10)


class Profile(BaseModel):
    """Exactly what find.html saves as the student profile."""
    exam: str                                   # JEE Main / JEE Advanced / BITSAT / REAP / Other
    rankOrScore: float = Field(..., gt=0)       # rank, or BITSAT score
    category: str = "Open (Gen)"
    domicile: str = "Rajasthan (Home State)"
    gender: str = "Male"
    preferredBranches: List[str] = []
    familyIncome: Optional[float] = None
    priorities: Priorities = Priorities()
    needHostel: bool = False


class CompareRequest(BaseModel):
    ids: List[str] = Field(..., min_length=2, max_length=3)   # 2 or 3 college IDs


class BranchVsCollegeRequest(BaseModel):
    collegeA: str
    branchA: str
    collegeB: str
    branchB: str


# ---------------------------------------------------------------------------
# GET endpoints: "just give me data"
# ---------------------------------------------------------------------------
@app.get("/")
def home():
    return {"message": "Rajasthan College Compass API is running",
            "data": "MOCK (demo only)",
            "docs": "/docs"}


@app.get("/colleges")
def get_colleges():
    return rec.COLLEGES


@app.get("/data")
def get_all_data():
    """Everything the website needs, in ONE call (the pages load this first)."""
    return {
        "colleges": rec.COLLEGES,
        "cutoffs": rec.CUTOFFS,
        "placements": rec.PLACEMENTS,
        "scholarships": rec.SCHOLARSHIPS,
    }


@app.get("/branches")
def get_branches():
    """Branch list for the checkboxes on find.html."""
    return rec.get_branches()


@app.get("/stats")
def get_stats():
    """Real counts for the home page."""
    return rec.get_stats()


@app.get("/cutoffs")
def get_cutoffs(college_id: Optional[str] = None, exam: Optional[str] = None):
    """Optional filters: /cutoffs?college_id=C01&exam=JEE Main"""
    rows = rec.CUTOFFS
    if college_id:
        rows = [r for r in rows if r["College ID"] == college_id]
    if exam:
        rows = [r for r in rows if r["Exam"] == exam]
    return rows


@app.get("/placements")
def get_placements():
    return rec.PLACEMENTS


@app.get("/scholarships")
def get_scholarships():
    return rec.SCHOLARSHIPS


# ---------------------------------------------------------------------------
# POST endpoints: "here is my data, think, and send me an answer"
# ---------------------------------------------------------------------------
@app.post("/recommend")
def recommend(profile: Profile):
    """find.html -> results.html. Returns ranked colleges with Safe/Target/Reach."""
    return rec.recommend(profile.model_dump())


@app.post("/compare")
def compare(req: CompareRequest):
    """compare.html: table data + 'You Gain / You Give Up' for each pair."""
    ids = list(dict.fromkeys(req.ids))          # remove duplicates, keep order
    colleges = []
    for cid in ids:
        c = rec.build_compare_college(cid)
        if c is None:
            raise HTTPException(status_code=404, detail=f"Unknown college id: {cid}")
        colleges.append(c)
    if len(colleges) < 2:
        raise HTTPException(status_code=400, detail="Pick at least 2 different colleges")

    pairs = [(0, 1)] + ([(0, 2), (1, 2)] if len(colleges) >= 3 else [])
    return {
        "colleges": colleges,
        "pairs": [
            {"a": colleges[i]["collegeId"], "b": colleges[j]["collegeId"],
             **rec.compare_pair(colleges[i], colleges[j])}
            for i, j in pairs
        ],
    }


@app.post("/branch-vs-college")
def branch_vs_college(req: BranchVsCollegeRequest):
    """branch-vs-college.html: compares (college A + branch A) with (college B + branch B)."""
    def option(cid, branch):
        college = next((c for c in rec.COLLEGES if c["College ID"] == cid), None)
        if college is None:
            raise HTTPException(status_code=404, detail=f"Unknown college id: {cid}")
        rows = [r for r in rec.CUTOFFS if r["College ID"] == cid and r["Branch"] == branch]
        return {
            "college": college,
            "branch": branch,
            "placementStats": rec.get_latest_placements(cid),
            "cutoff": rows[-1] if rows else None,      # latest row, like the old page did
        }

    a, b = option(req.collegeA, req.branchA), option(req.collegeB, req.branchB)
    return {"optionA": a, "optionB": b, "verdict": rec.evaluate_branch_vs_college(a, b)}