# brickOS Songwriter & Lyric Coach Workbench

A self-hosted, password-protected interactive songwriting workbench and lyric coach infused with the **Nashville Executive Producer & Lyric Studio SOP** from `brickOS`.

## Features

1. **"Finish Version" Progression:**
   * Finalizes an iteration of your lyrics (V1, V2, or V3).
   * Runs an automated theological & structural compliance audit (evaluating the OBI Funnel, Christianese Filter, and Throne Room Pivot).
   * Clones the refined lyrics into the next version slot and immediately switches to the 3-Way Comparison Matrix.
2. **Real-Time Syllable Counter & Rhyme Scheme Engine:**
   * Algorithmic syllable counter displayed in the line gutter.
   * End-of-line rhyme sound extraction and color-coded rhyme badges (A, B, C...).
3. **3-Way Multi-Version Matrix (1-Screen Comparison):**
   * Compare Version 1 (Raw Flow), Version 2 (Refined Cadence), and Version 3 (Radio Cut) side-by-side on a single screen.
   * Includes 1-click line cherry-picking and copying between versions.
4. **Suno v5.5 4-Block Blueprint Generator:**
   * One-click generation of the standardized 4-block production blueprint adhering to the BMV naming standard (`[Project]_[Archetype]_[Version]_BMV1`), vocal delivery tags, artifact killer exclusion string, and Nashville slider values.
5. **Security Gate:**
   * Password protected with client-side SHA-256 hashing.
   * **Default Password:** `story`

## Deployment & Local Testing

### Instant Local Launch
Run inside this directory:
```bash
python -m http.server 8081
```
Then visit: `http://localhost:8081` in your browser.
