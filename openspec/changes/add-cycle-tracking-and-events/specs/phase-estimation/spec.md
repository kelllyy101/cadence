# Spec Delta

## Purpose

Estimates which cycle phase a date falls in from the user's own period start dates, using a
simple, explainable method that admits uncertainty instead of guessing.

## ADDED Requirements

### Requirement: Typical cycle length
The typical cycle length SHALL be the median of gaps between up to the last 6 consecutive
starts, excluding gaps outside 15–60 days; with fewer than 2 valid gaps it SHALL default to 28
days with low confidence.

#### Scenario: One start only
- **GIVEN** a single logged start
- **WHEN** a later date is estimated
- **THEN** the estimate uses 28 days with low confidence

#### Scenario: Short gap excluded
- **GIVEN** two starts 3 days apart among regular 29-day cycles
- **WHEN** the typical length is computed
- **THEN** the 3-day gap is excluded

### Requirement: Phase boundaries
For cycle length L, phases SHALL be menstrual days 1–5, ovulatory days L−15 to L−13, follicular
from day 6 to the ovulatory window, and luteal to day L, clamped so each phase has at least one
day; dates between two recorded starts SHALL use that cycle's actual length.

#### Scenario: Day 3
- **GIVEN** a 28-day typical cycle
- **WHEN** cycle day 3 is estimated
- **THEN** the phase is menstrual

#### Scenario: Historic cycle uses actual gap
- **GIVEN** two recorded starts 32 days apart
- **WHEN** a date between them is estimated
- **THEN** L is 32 for that date

### Requirement: Unknown states
The estimate SHALL be `unknown` with a reason when there is no data, the date is before the
first entry, the date is more than L+7 days after the last start, or recent gaps vary by more
than 9 days.

#### Scenario: Overdue
- **GIVEN** the last start was L+8 days ago
- **WHEN** today is estimated
- **THEN** the result is unknown with reason `cycle_overdue`

#### Scenario: Irregular
- **GIVEN** recent gaps of 22, 35 and 29 days
- **WHEN** a date after the last start is estimated
- **THEN** the result is unknown with reason `irregular`

#### Scenario: Before first entry
- **WHEN** a date before the first entry is estimated
- **THEN** the result is unknown with reason `before_first_entry`

### Requirement: Always labelled an estimate
Every display of a phase SHALL read "Estimated phase" with an explainer stating it is not medical
advice or contraception and may be unreliable with hormonal contraception, perimenopause or
conditions like PCOS, without asking the user about these.

#### Scenario: Today's phase shown
- **GIVEN** three logged starts and current consent
- **WHEN** the user views today
- **THEN** the phase shows with the label "Estimate — not medical advice" and an explainer
