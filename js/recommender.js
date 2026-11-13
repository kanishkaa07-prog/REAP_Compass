/**
 * ============================================================================
 * Rajasthan Engineering College Recommender - Recommendation Engine
 * File: js/recommender.js
 * ============================================================================
 * 
 * This module handles the core intelligence of the application:
 * 1. Filtering colleges by gender and exam eligibility.
 * 2. Determining admission chances (Safe / Target / Reach).
 *    - Handles RANK-based exams (lower is better): JEE Main, JEE Adv, REAP.
 *    - Handles SCORE-based exams (higher is better): BITSAT (out of 390).
 * 3. Calculating a normalized 0-100% Match Score based on user sliders.
 * 4. Generating personalized "Why it fits" and "Choose it when" explanations.
 * 5. Checking scholarship qualification amounts.
 * 6. Pairwise "You Gain / You Lose" trade-off comparison engine.
 * 
 * NOTE FOR FUTURE ML / DATA SCIENCE INTEGRATION:
 * The function `calculateMatchScore()` and `assessChanceTag()` are intentionally
 * self-contained and heavily commented. A teammate can replace the rule-based
 * formulas below with an API call to a trained ML model (e.g., Random Forest or
 * Multi-Criteria Decision Making MCDM algorithm) without altering UI components.
 * ============================================================================
 */

const Recommender = {

  /**
   * Main recommendation pipeline:
   * Takes a student profile object and returns an array of ranked college results.
   *
   * @param {Object} profile - Student's inputs:
   *   - exam: string ('JEE Main', 'JEE Advanced', 'BITSAT', 'REAP', 'Other')
   *   - rankOrScore: number (Rank or BITSAT score)
   *   - category: string ('Open (Gen)', 'OBC-NCL', 'EWS', 'SC', 'ST')
   *   - domicile: string ('Rajasthan (Home State)', 'Other State')
   *   - gender: string ('Male', 'Female', 'Other')
   *   - preferredBranches: Array<string> (e.g. ['Computer Science & Engineering', 'Civil Engineering'])
   *   - familyIncome: number | null
   *   - priorities: { fees: number, placements: number, location: number, reputation: number } (0-10)
   *   - needHostel: boolean
   * @returns {Array<Object>} Sorted list of recommended colleges with match details.
   */
  recommend(profile) {
    if (!window.COLLEGES_DATA || !window.CUTOFFS_DATA) {
      console.warn("Dataset not loaded yet.");
      return [];
    }

    const {
      exam,
      rankOrScore,
      category = 'Open (Gen)',
      domicile = 'Rajasthan (Home State)',
      gender = 'Male',
      preferredBranches = [],
      familyIncome = null,
      priorities = { fees: 5, placements: 5, location: 5, reputation: 5 },
      needHostel = false
    } = profile;

    const isBitSat = exam === 'BITSAT';
    const isFemale = gender === 'Female';

    // ------------------------------------------------------------------------
    // Step 1: Pre-calculate min/max fee and distance bounds for normalisation
    // ------------------------------------------------------------------------
    const costList = window.COLLEGES_DATA.map(c => {
      const tuition = Number(c['Annual Tuition (INR)']) || 0;
      const hostel = needHostel ? (Number(c['Hostel Fee / Year (INR)']) || 0) : 0;
      return tuition + hostel;
    });
    const minCost = Math.min(...costList);
    const maxCost = Math.max(...costList);

    const distList = window.COLLEGES_DATA.map(c => Number(c['Distance from Jaipur (km, approx)']) || 0);
    const maxDist = Math.max(...distList) || 350;

    // ------------------------------------------------------------------------
    // Step 2: Iterate over each college and evaluate admission & branch fit
    // ------------------------------------------------------------------------
    const recommendations = [];

    for (const college of window.COLLEGES_DATA) {
      // Rule A: Women-only college filter (Banasthali Vidyapith)
      if (college['Gender Eligibility'] === 'Women only' && !isFemale) {
        continue; // Skip women-only college for male/other students
      }

      // Rule B: Match cutoff rows for this college
      const matchedBranches = this.evaluateCollegeCutoffs(
        college['College ID'],
        exam,
        rankOrScore,
        category,
        domicile,
        preferredBranches,
        isBitSat
      );

      // If no preferred branch has a viable chance (Safe/Target/Reach), college is excluded
      if (matchedBranches.length === 0) {
        continue;
      }

      // Pick best branch chance (Safe > Target > Reach)
      const bestBranchFit = this.getBestBranchFit(matchedBranches);

      // Rule C: Calculate normalized component scores (0 to 100)
      const annualTuition = Number(college['Annual Tuition (INR)']) || 0;
      const annualHostel = Number(college['Hostel Fee / Year (INR)']) || 0;
      const totalAnnualCost = annualTuition + (needHostel ? annualHostel : 0);

      const feesScore = this.calcFeesScore(totalAnnualCost, minCost, maxCost);
      const placementsScore = this.calcPlacementsScore(college['College ID']);
      const locationScore = this.calcLocationScore(Number(college['Distance from Jaipur (km, approx)']) || 0, maxDist);
      const reputationScore = this.calcReputationScore(college);

      // Rule D: Calculate weighted Match Score (0 to 100%)
      const matchScore = this.calculateWeightedMatchScore(
        { feesScore, placementsScore, locationScore, reputationScore },
        priorities
      );

      // Rule E: Get latest placement details for display
      const placementStats = this.getLatestPlacements(college['College ID']);

      // Rule F: Dynamic Explanations
      const fitReason = this.generateFitReason(college, priorities, placementStats, totalAnnualCost);
      const chooseWhen = this.generateChooseWhen(college);

      // Rule G: Check potential scholarships
      const maxScholarship = this.checkScholarshipEligibility(college['College ID'], category, familyIncome);

      // Rule H: Data Confidence Badge
      const confidenceBadge = this.getDataConfidence(college['Data Status']);

      recommendations.push({
        college,
        collegeId: college['College ID'],
        collegeName: college['College Name'],
        city: college['City'],
        type: college['Type'],
        totalAnnualCost,
        annualTuition,
        annualHostel,
        distanceFromJaipur: Number(college['Distance from Jaipur (km, approx)']) || 0,
        bestChance: bestBranchFit.chance,      // 'Safe' | 'Target' | 'Reach'
        bestBranchName: bestBranchFit.branch,
        bestClosingValue: bestBranchFit.closingValue,
        matchedBranches,
        matchScore,                            // 0 to 100
        componentScores: { feesScore, placementsScore, locationScore, reputationScore },
        placementStats,
        fitReason,
        chooseWhen,
        maxScholarship,
        confidenceBadge,
        naac: college['NAAC Grade'] || 'Not Accredited',
        nba: college['NBA Accredited'] || 'No',
        nirf: college['NIRF Engineering Band'] || 'Not Ranked'
      });
    }

    // Default sort by Match Score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations;
  },

  /**
   * Evaluates all cutoffs for a college against the student's exam, rank/score, and preferences.
   */
  evaluateCollegeCutoffs(collegeId, exam, rankOrScore, category, domicile, preferredBranches, isBitSat) {
    const collegeCutoffs = window.CUTOFFS_DATA.filter(row => {
      return row['College ID'] === collegeId && row['Exam'] === exam;
    });

    if (collegeCutoffs.length === 0) return [];

    // Preferred Quota resolution:
    // If student is from Rajasthan, check Home State -> All India -> Not applicable -> Other State.
    // If student is Other State, check Other State -> All India -> Not applicable -> Home State.
    const isHome = domicile.includes('Home State') || domicile.includes('Rajasthan');
    const quotaPriority = isHome 
      ? ['Home State', 'All India', 'Not applicable', 'Other State']
      : ['Other State', 'All India', 'Not applicable', 'Home State'];

    const matched = [];

    // Filter to preferred branches (or all branches if user chose none)
    const targetBranches = preferredBranches.length > 0 
      ? preferredBranches 
      : Array.from(new Set(collegeCutoffs.map(c => c['Branch'])));

    for (const branch of targetBranches) {
      // Find rows matching branch
      const branchRows = collegeCutoffs.filter(r => r['Branch'] === branch);
      if (branchRows.length === 0) continue;

      // Select row matching latest year (e.g. 2024, or 2023)
      const latestYear = Math.max(...branchRows.map(r => Number(r['Year']) || 0));
      const yearRows = branchRows.filter(r => Number(r['Year']) === latestYear);

      // Find matching quota according to priority
      let chosenRow = null;
      for (const q of quotaPriority) {
        const quotaMatches = yearRows.filter(r => r['Quota'] === q);
        if (quotaMatches.length > 0) {
          // Category match: exact category first, then fallback to Open (Gen)
          chosenRow = quotaMatches.find(r => r['Category'] === category) || 
                      quotaMatches.find(r => r['Category'] === 'Open (Gen)') ||
                      quotaMatches[0];
          break;
        }
      }

      if (!chosenRow) {
        // Fallback to any quota if none matched priority
        chosenRow = yearRows.find(r => r['Category'] === category) || yearRows[0];
      }

      if (chosenRow) {
        const closingValue = Number(chosenRow['Closing Value']);
        const chance = this.assessChanceTag(rankOrScore, closingValue, isBitSat);

        // If eligible (Safe, Target, Reach), include it
        if (chance) {
          matched.push({
            branch,
            year: chosenRow['Year'],
            quota: chosenRow['Quota'],
            category: chosenRow['Category'],
            closingValue,
            valueType: chosenRow['Value Type'],
            chance
          });
        }
      }
    }

    return matched;
  },

  /**
   * Chance Tag Decision Function:
   * 
   * For RANK exams (JEE Main, Advanced, REAP):
   * - Lower rank is better.
   * - Safe:   rank <= 80% of closing rank (well within comfortable admission zone)
   * - Target: 80% < rank <= 110% of closing rank (competitive, very likely)
   * - Reach:  110% < rank <= 130% of closing rank (dream/borderline)
   * - Beyond 130%: hidden / not viable.
   * 
   * For SCORE exams (BITSAT out of 390):
   * - Higher score is better! Inverted logic.
   * - Safe:   score >= closing + 15  (or score >= 1.05 * closing)
   * - Target: closing - 15 <= score < closing + 15
   * - Reach:  closing - 30 <= score < closing - 15
   * - Below that: hidden.
   */
  assessChanceTag(rankOrScore, closingValue, isBitSat) {
    if (!rankOrScore || !closingValue || closingValue <= 0) return null;

    if (isBitSat) {
      // Higher score is better
      if (rankOrScore >= closingValue + 15 || rankOrScore >= 1.05 * closingValue) {
        return 'Safe';
      } else if (rankOrScore >= closingValue - 15 || rankOrScore >= 0.95 * closingValue) {
        return 'Target';
      } else if (rankOrScore >= closingValue - 30 || rankOrScore >= 0.90 * closingValue) {
        return 'Reach';
      }
      return null; // Below reach threshold
    } else {
      // Lower rank is better
      const ratio = rankOrScore / closingValue;
      if (ratio <= 0.80) {
        return 'Safe';
      } else if (ratio <= 1.10) {
        return 'Target';
      } else if (ratio <= 1.30) {
        return 'Reach';
      }
      return null; // Exceeds 130% reach threshold
    }
  },

  /**
   * Helper to pick the best chance tag across multiple matched branches.
   */
  getBestBranchFit(matchedBranches) {
    const order = { 'Safe': 1, 'Target': 2, 'Reach': 3 };
    const sorted = [...matchedBranches].sort((a, b) => {
      return (order[a.chance] || 99) - (order[b.chance] || 99);
    });
    return sorted[0];
  },

  /**
   * Fees Normalization Score (0-100): Lower total cost = higher score
   */
  calcFeesScore(cost, minCost, maxCost) {
    if (maxCost <= minCost) return 80;
    // Linear inversion: minCost gets 100, maxCost gets 20
    const normalized = 100 - ((cost - minCost) / (maxCost - minCost)) * 80;
    return Math.round(Math.max(15, Math.min(100, normalized)));
  },

  /**
   * Placements Normalization Score (0-100):
   * Higher average package, median package, and placement % = higher score
   */
  calcPlacementsScore(collegeId) {
    const stats = this.getLatestPlacements(collegeId);
    if (!stats) return 50;

    const avg = Number(stats['Avg Package (LPA)']) || 0;
    const median = Number(stats['Median Package (LPA)']) || 0;
    const pct = Number(stats['Placement %']) || 0;

    // Normalizing assumptions based on dataset: top avg ~28 LPA, top placement ~96%
    const avgScore = Math.min(100, (avg / 28) * 100);
    const medianScore = Math.min(100, (median / 24) * 100);
    const pctScore = Math.min(100, pct);

    // Weighted placements metric
    const composite = 0.45 * avgScore + 0.35 * medianScore + 0.20 * pctScore;
    return Math.round(Math.max(10, Math.min(100, composite)));
  },

  /**
   * Location Score (0-100): Closer to Jaipur = higher score
   */
  calcLocationScore(distanceKm, maxDist) {
    // 0 km (in Jaipur) gets 100 points
    const score = 100 - (distanceKm / maxDist) * 80;
    return Math.round(Math.max(20, Math.min(100, score)));
  },

  /**
   * Reputation Score (0-100):
   * Combines NAAC Grade (40%), NBA Accreditation (20%), and NIRF Band (40%)
   */
  calcReputationScore(college) {
    // NAAC scoring
    const naac = (college['NAAC Grade'] || '').toUpperCase();
    let naacScore = 40;
    if (naac.includes('A++')) naacScore = 100;
    else if (naac.includes('A+')) naacScore = 90;
    else if (naac.includes('A')) naacScore = 80;
    else if (naac.includes('B++')) naacScore = 70;
    else if (naac.includes('B+')) naacScore = 60;
    else if (naac.includes('B')) naacScore = 50;

    // NBA scoring
    const nba = (college['NBA Accredited'] || '').toLowerCase();
    const nbaScore = nba.includes('yes') ? 95 : 40;

    // NIRF scoring: understands 'Top 30', 'Top 60', '101-150', '201-300', 'Not ranked'
    const nirf = (college['NIRF Engineering Band'] || '').toLowerCase();
    let nirfScore = 40;
    const topMatch = nirf.match(/^top\s*(\d+)/);
    const rangeMatch = nirf.match(/^(\d+)\s*-\s*(\d+)/);
    if (topMatch) {
      const n = Number(topMatch[1]);
      nirfScore = n <= 60 ? 100 : n <= 100 ? 85 : n <= 150 ? 70 : 55;
    } else if (rangeMatch) {
      const hi = Number(rangeMatch[2]);
      nirfScore = hi <= 100 ? 85 : hi <= 150 ? 70 : hi <= 200 ? 55 : hi <= 300 ? 45 : 40;
    }

    const total = 0.40 * naacScore + 0.20 * nbaScore + 0.40 * nirfScore;
    return Math.round(Math.max(20, Math.min(100, total)));
  },

  /**
   * Weighted Match Score Calculator (0-100%)
   * Multiplies normalized component scores with the user's 4 priority sliders.
   */
  calculateWeightedMatchScore(scores, priorities) {
    const wFees = Number(priorities.fees) || 0;
    const wPlacements = Number(priorities.placements) || 0;
    const wLoc = Number(priorities.location) || 0;
    const wRep = Number(priorities.reputation) || 0;

    const totalWeight = wFees + wPlacements + wLoc + wRep;

    // If user left all sliders at 0, treat them as equal weight 1
    if (totalWeight === 0) {
      const avg = (scores.feesScore + scores.placementsScore + scores.locationScore + scores.reputationScore) / 4;
      return Math.round(avg);
    }

    const weightedSum = (
      scores.feesScore * wFees +
      scores.placementsScore * wPlacements +
      scores.locationScore * wLoc +
      scores.reputationScore * wRep
    );

    return Math.round(Math.max(10, Math.min(100, weightedSum / totalWeight)));
  },

  /**
   * Retrieves the most recent placement data for a college.
   */
  getLatestPlacements(collegeId) {
    if (!window.PLACEMENTS_DATA) return null;
    const rows = window.PLACEMENTS_DATA.filter(p => p['College ID'] === collegeId);
    if (rows.length === 0) return null;

    // Pick 2024 or newest year
    rows.sort((a, b) => (Number(b['Year']) || 0) - (Number(a['Year']) || 0));
    return rows[0];
  },

  /**
   * Generates a dynamic 1-2 sentence "Why it fits" explanation based on
   * which priority the student weighted highest and the college's standout attributes.
   */
  generateFitReason(college, priorities, placements, totalCost) {
    const dist = Number(college['Distance from Jaipur (km, approx)']) || 0;
    const avgPkg = placements ? Number(placements['Avg Package (LPA)']) : 0;
    const naac = college['NAAC Grade'];

    // Identify user's highest priority slider
    const entries = Object.entries(priorities);
    entries.sort((a, b) => b[1] - a[1]);
    const topPriority = entries[0][0];

    if (topPriority === 'placements' && avgPkg >= 12) {
      return `Outstanding placement record featuring an average package of ${avgPkg} LPA and strong campus recruitment align directly with your high career focus.`;
    } else if (topPriority === 'fees' && totalCost < 150000) {
      return `Very affordable annual expenditure of approximately ₹${totalCost.toLocaleString('en-IN')}, making it an ideal high-ROI option for your fee priority.`;
    } else if (topPriority === 'location' && dist <= 25) {
      return `Prime location situated right in Jaipur city (${dist} km), minimizing travel and giving direct access to Rajasthan's premier tech ecosystem.`;
    } else if (topPriority === 'reputation' && (college['NIRF Engineering Band'] || naac === 'A++' || naac === 'A+')) {
      return `Prestigious national standing with NAAC Grade ${naac || 'A'} and recognized NIRF recognition, meeting your preference for academic brand value.`;
    }

    // Default balanced reason
    return `Balanced overall match offering reliable academic quality, ${avgPkg ? avgPkg + ' LPA average package' : 'good campus placements'}, and strong alumni connection across Rajasthan.`;
  },

  /**
   * Generates a "Choose it when..." recommendation persona for each institute.
   */
  generateChooseWhen(college) {
    const type = college['Type'];
    const name = college['College Name'];
    const naac = college['NAAC Grade'];

    if (name.includes('MNIT') || name.includes('IIT')) {
      return "Choose it when you want Tier-1 national institute prestige, peer network, and top core/tech campus placements.";
    } else if (name.includes('BITS')) {
      return "Choose it when you desire a world-class private university with zero attendance policy, elite alumni, and top international opportunities.";
    } else if (type === 'Govt') {
      return "Choose it when keeping your education cost low with high ROI and university campus independence is your primary goal.";
    } else if (name.includes('Banasthali')) {
      return "Choose it when seeking a holistic, women-centric educational environment with strong residential campus culture.";
    } else if (type === 'Deemed' || name.includes('LNMIIT') || name.includes('Manipal')) {
      return "Choose it when you want modern infrastructure, industry-focused coding culture, and modern campus amenities.";
    } else {
      return "Choose it when you want a disciplined engineering college in Rajasthan with good local industry placement support.";
    }
  },

  /**
   * Checks if candidate qualifies for scholarships and returns maximum benefit amount.
   */
  checkScholarshipEligibility(collegeId, category, familyIncome) {
    if (!window.SCHOLARSHIPS_DATA) return 0;
    let maxAmount = 0;

    for (const s of window.SCHOLARSHIPS_DATA) {
      // Check college match: 'ALL' or specific college ID
      if (s['College ID'] !== 'ALL' && s['College ID'] !== collegeId) {
        continue;
      }

      // Check Category
      const eligibleCat = s['Eligible Category'] || 'All';
      const catMatch = (
        eligibleCat === 'All' ||
        eligibleCat.includes(category) ||
        (eligibleCat.includes('SC') && category === 'SC') ||
        (eligibleCat.includes('ST') && category === 'ST') ||
        (eligibleCat.includes('OBC') && category === 'OBC-NCL') ||
        (eligibleCat.includes('EWS') && category === 'EWS')
      );

      if (!catMatch) continue;

      // Check Income limit
      if (familyIncome !== null && familyIncome !== undefined && familyIncome !== '') {
        const limit = Number(s['Income Limit (INR/yr)']);
        if (limit && Number(familyIncome) > limit) {
          continue; // Income exceeds limit
        }
      }

      const amount = Number(s['Benefit Amount (INR/yr)']) || 0;
      if (amount > maxAmount) {
        maxAmount = amount;
      }
    }

    return maxAmount;
  },

  /**
   * Data Confidence Badge Logic
   * In Demo Mode: returns MOCK badge.
   * Future logic: SOURCED + Verified = High (green), SOURCED only = Medium (amber), else Low (red).
   */
  getDataConfidence(dataStatus) {
    if (dataStatus === 'MOCK' || !dataStatus) {
      return {
        label: 'Demo data',
        class: 'badge-mock',
        tooltip: 'Synthetic mock dataset for UI demonstration'
      };
    }
    // Future expansion when live data is plugged in
    return {
      label: 'Verified Data',
      class: 'badge-safe',
      tooltip: 'Sourced from official counseling bulletins'
    };
  },

  /**
   * Pairwise Trade-off Analysis Generator ("You Gain / You Lose")
   * Compares College A vs College B and produces clear bullet points.
   */
  comparePair(collegeA, collegeB) {
    const gains = [];
    const losses = [];

    // 1. Fees difference
    const feeA = collegeA.totalAnnualCost;
    const feeB = collegeB.totalAnnualCost;
    const feeDiff = Math.abs(feeA - feeB);

    if (feeA < feeB) {
      gains.push(`Lower annual cost: save approx ₹${feeDiff.toLocaleString('en-IN')}/year compared to ${collegeB.collegeName}.`);
    } else if (feeA > feeB) {
      losses.push(`Higher annual cost: pay approx ₹${feeDiff.toLocaleString('en-IN')}/year more than ${collegeB.collegeName}.`);
    }

    // 2. Placements difference
    const pkgA = collegeA.placementStats ? Number(collegeA.placementStats['Avg Package (LPA)']) : 0;
    const pkgB = collegeB.placementStats ? Number(collegeB.placementStats['Avg Package (LPA)']) : 0;
    const pkgDiff = Math.abs(pkgA - pkgB).toFixed(1);

    if (pkgA > pkgB + 0.5) {
      gains.push(`Higher average placement package (+${pkgDiff} LPA) with stronger recruiter presence.`);
    } else if (pkgA < pkgB - 0.5) {
      losses.push(`Lower average package (-${pkgDiff} LPA) than ${collegeB.collegeName}.`);
    }

    // 3. Location distance difference
    const distA = collegeA.distanceFromJaipur;
    const distB = collegeB.distanceFromJaipur;
    const distDiff = Math.abs(distA - distB);

    if (distA < distB) {
      gains.push(`Closer to Jaipur (${distA} km vs ${distB} km), offering better connectivity and urban opportunities.`);
    } else if (distA > distB) {
      losses.push(`Further away from Jaipur (${distA} km vs ${distB} km), requiring longer travel.`);
    }

    // 4. Reputation / NIRF
    const nirfA = collegeA.nirf;
    const nirfB = collegeB.nirf;
    const isTopNirf = s => { const m = (s || '').toLowerCase().match(/^top\s*(\d+)/); return !!m && Number(m[1]) <= 60; };
    if (isTopNirf(nirfA) && !isTopNirf(nirfB)) {
      gains.push(`Top Tier NIRF standing (${nirfA}), enjoying higher national recognition.`);
    } else if (!nirfA.includes('Top') && nirfB.includes('Top')) {
      losses.push(`Lower NIRF standing compared to ${collegeB.collegeName} (${nirfB}).`);
    }

    if (gains.length === 0) {
      gains.push("Comparable academic curriculum and similar campus exposure.");
    }
    if (losses.length === 0) {
      losses.push("No major compromise observed against the compared institution.");
    }

    return { gains, losses };
  },

  /**
   * Branch vs College Verdict Generator
   * Compares Option A (College A + Branch A) vs Option B (College B + Branch B).
   */
  evaluateBranchVsCollege(optA, optB) {
    const isTechA = optA.branch.toLowerCase().includes('computer') || optA.branch.toLowerCase().includes('information') || optA.branch.toLowerCase().includes('ai');
    const isTechB = optB.branch.toLowerCase().includes('computer') || optB.branch.toLowerCase().includes('information') || optB.branch.toLowerCase().includes('ai');

    const repA = this.calcReputationScore(optA.college);
    const repB = this.calcReputationScore(optB.college);

    const pkgA = optA.placementStats ? Number(optA.placementStats['Avg Package (LPA)']) : 0;
    const pkgB = optB.placementStats ? Number(optB.placementStats['Avg Package (LPA)']) : 0;

    let verdict = "";

    if (repA > repB + 20 && !isTechA && isTechB) {
      verdict = `Classic dilemma: Option A gives you the prestigious brand of ${optA.college['College Name']} (${repA}/100 reputation), but Option B gives you high-demand Tech (${optB.branch}) at ${optB.college['College Name']}. If software/tech roles are your absolute passion, choose Option B. If you value peer network, higher education abroad, or PSU/consulting roles, Option A's college brand will open bigger doors.`;
    } else if (repB > repA + 20 && isTechA && !isTechB) {
      verdict = `Option A offers your preferred tech stream (${optA.branch}) at a mid-tier college, while Option B provides the elite brand of ${optB.college['College Name']}. If you are committed to software development, Option A will let you code from day one without branch-switch pressure.`;
    } else if (pkgA > pkgB + 3) {
      verdict = `Option A strongly outperforms Option B in placement returns (${pkgA} LPA avg vs ${pkgB} LPA avg) with comparable academic standing. Option A is recommended for higher career return on investment.`;
    } else {
      verdict = `Both options have balanced merits. Option A (${optA.college['College Name']} - ${optA.branch}) and Option B (${optB.college['College Name']} - ${optB.branch}) offer similar career opportunities. Choose based on proximity to your hometown and tuition affordability.`;
    }

    return verdict;
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.Recommender = Recommender;
}