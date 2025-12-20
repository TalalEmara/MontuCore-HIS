import React, { useState, useMemo } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import Pagination from "../../components/level-0/Pagination/Pagination";
import List from "../../components/level-0/List/List";
import styles from "./ManagerDashboardView.module.css";

const athlete_data = [
  { id: 1, athleteFullName: "Lionel Messi", athleteFieldPosition: "Forward", athleteJerseyNumber: 10, caseStatus: "ACTIVE", Severity: "MILD" },
  { id: 2, athleteFullName: "Cristiano Ronaldo", athleteFieldPosition: "Striker", athleteJerseyNumber: 7, caseStatus: "RECOVERED", Severity: "MODERATE" },
  { id: 3, athleteFullName: "Cristiano", athleteFieldPosition: "Midfielder", athleteJerseyNumber: 17, caseStatus: "ACTIVE", Severity: "SEVERE" },
  { id: 4, athleteFullName: "Messi", athleteFieldPosition: "Defender", athleteJerseyNumber: 4, caseStatus: "ACTIVE", Severity: "CRITICAL" },
  { id: 5, athleteFullName: "Mbappe", athleteFieldPosition: "Forward", athleteJerseyNumber: 7, caseStatus: "RECOVERED", Severity: "MILD" },
  { id: 6, athleteFullName: "Mohamed salah", athleteFieldPosition: "Goalkeeper", athleteJerseyNumber: 1, caseStatus: "ACTIVE", Severity: "MODERATE" },
];

const staff_data = [
  { id: 1, clinicanName: "Dr. Ahmed", specialty: "Physiotherapy", activeCasesCount: 12 },
  { id: 2, clinicanName: "Dr. Sarah", specialty: "Orthopedic", activeCasesCount: 8 },
  { id: 3, clinicanName: "Dr. Mariam", specialty: "Sports Med", activeCasesCount: 15 },
  { id: 4, clinicanName: "Dr. kareem", specialty: "Nutrition", activeCasesCount: 6 },
  { id: 5, clinicanName: "Dr. Mohamed", specialty: "Physiotherapy", activeCasesCount: 10 },
  { id: 6, clinicanName: "Dr. Mo", specialty: "Physiotherapy", activeCasesCount: 16 },
];

const ManagerDashboard: React.FC = () => {
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [currentPage, setPage] = useState(1);

  const totalPages = 5;
  const Total_medical_spent = 125450;

  const totalCasesAnalysis = athlete_data.length;
  const activeCasesAnalysis = athlete_data.filter(c => c.caseStatus === "ACTIVE").length;
  const recoveredCasesAnalysis = athlete_data.filter(c => c.caseStatus === "RECOVERED").length;

  const severityAnalysisCounts = {
    CRITICAL: athlete_data.filter(c => c.Severity === "CRITICAL").length,
    SEVERE: athlete_data.filter(c => c.Severity === "SEVERE").length,
    MODERATE: athlete_data.filter(c => c.Severity === "MODERATE").length,
    MILD: athlete_data.filter(c => c.Severity === "MILD").length,
  };

  // Pie chart style (shared for severity & appointment)
  const pieAnalysisStyle = {
    "--critical": `${(severityAnalysisCounts.CRITICAL / totalCasesAnalysis) * 100}%`,
    "--severe": `${(severityAnalysisCounts.SEVERE / totalCasesAnalysis) * 100}%`,
    "--moderate": `${(severityAnalysisCounts.MODERATE / totalCasesAnalysis) * 100}%`,
    "--mild": `${(severityAnalysisCounts.MILD / totalCasesAnalysis) * 100}%`,
  } as React.CSSProperties;

  const mappedAthleteRows = useMemo(() => {
    return athlete_data
      .filter(c =>
        c.athleteFullName.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        c.athleteFieldPosition.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        c.athleteJerseyNumber.toString().includes(caseSearchQuery) ||
        c.caseStatus.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        c.Severity.toLowerCase().includes(caseSearchQuery.toLowerCase())
      )
      .map(c => [
        <span className={styles.athleteNameText}>{c.athleteFullName}</span>,
        <span className={styles.athletePosition}>{c.athleteFieldPosition}</span>,
        <span className={styles.athleteJerseyText}>#{c.athleteJerseyNumber}</span>,
        <span className={c.caseStatus === "ACTIVE" ? styles.statusActiveText : styles.statusRecoveredText}>{c.caseStatus}</span>,
        <span className={styles[`severity${c.Severity}Text`]}>{c.Severity}</span>,
      ]);
  }, [caseSearchQuery]);

  const mappedStaffAnalysisRows = useMemo(() => {
    return staff_data
      .filter(s =>
        s.clinicanName.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.specialty.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.activeCasesCount.toString().includes(staffSearchQuery)
      )
      .map(s => [
        <span className={styles.clinicanNameText}>{s.clinicanName}</span>,
        <span className={styles.clinicanSpecialty}>{s.specialty}</span>,
        <span className={styles.activeCasesCountBadge}>{s.activeCasesCount} Cases</span>,
      ]);
  }, [staffSearchQuery]);

  const appointmentStatusCounts = {
    SCHEDULED: 4,
    COMPLETED: 6,
    CANCELLED: 2,
  };

  const totalAppointments =
    appointmentStatusCounts.SCHEDULED +
    appointmentStatusCounts.COMPLETED +
    appointmentStatusCounts.CANCELLED;

  const completionRate = ((appointmentStatusCounts.COMPLETED / totalAppointments) * 100).toFixed(1);

  const appointmentPieStyle = {
    "--completed": `${(appointmentStatusCounts.COMPLETED / totalAppointments) * 100}%`,
    "--scheduled": `${(appointmentStatusCounts.SCHEDULED / totalAppointments) * 100}%`,
    "--cancelled": `${(appointmentStatusCounts.CANCELLED / totalAppointments) * 100}%`,
  } as React.CSSProperties;

  return (
    <div className={styles.managerDashboardContainer}>
      <TopBar Name="Mohamed Ahmed" Role="Club Manager" />

      <div className={styles.casesAnalysisHeaderGrid}>
        <div className={styles.casesSummaryAnalysisPanel}>
          <div className={styles.totalSpentCard}>
            <span className={styles.analysisLabelText}>Total Medical Spend</span>
            <div className={styles.totalSpentNumber}>${Total_medical_spent.toLocaleString()}</div>
          </div>

          <div className={styles.casesStatusAnalysis}>
            <div className={styles.casesStatusAnalysisSplitRow}>
              <div className={styles.statusAnalysisGroup}>
                <span className={styles.analysisLabelText}>Total Cases</span>
                <div className={styles.analysisValueTotal}>{totalCasesAnalysis}</div>
              </div>

              <div className={styles.analysisVerticalSeparator} />

              <div className={styles.statusAnalysisGroup}>
                <span className={styles.analysisLabelText}>Active</span>
                <div className={styles.analysisValueActive}>{activeCasesAnalysis}</div>
              </div>

              <div className={styles.analysisVerticalSeparator} />

              <div className={styles.statusAnalysisGroup}>
                <span className={styles.analysisLabelText}>Recovered</span>
                <div className={styles.analysisValueRecovered}>{recoveredCasesAnalysis}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartsAnalysisRow}>
          <AdjustableCard className={styles.severityPieAnalysisCard}>
            <h3 className={styles.analysisSectionHeading}>Severity Analysis Distribution</h3>
            <div className={styles.PieChartFlexBody}>
              <div className={`${styles.pieChartCircle} ${styles.severityPieCircle}`} style={pieAnalysisStyle}>
                <div className={styles.severityPieChartInnerHole}>
                  <span className={styles.severityPieCenterValue}>{totalCasesAnalysis}</span>
                  <span className={styles.PieCenterLabel}>Cases</span>
                </div>
              </div>

              <div className={styles.severityPieChartList}>
                <div className={styles.severityRow}><span className={styles.IndicatorCritical} /> Critical ({severityAnalysisCounts.CRITICAL})</div>
                <div className={styles.severityRow}><span className={styles.IndicatorSevere} /> Severe ({severityAnalysisCounts.SEVERE})</div>
                <div className={styles.severityRow}><span className={styles.IndicatorModerate} /> Moderate ({severityAnalysisCounts.MODERATE})</div>
                <div className={styles.severityRow}><span className={styles.IndicatorMild} /> Mild ({severityAnalysisCounts.MILD})</div>
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className={styles.appointmentPieChartCard}>
            <h3 className={styles.analysisSectionHeading}>Appointment Status Distribution</h3>
            <div className={styles.PieChartFlexBody}>
              <div className={`${styles.pieChartCircle} ${styles.appointmentPieCircle}`} style={appointmentPieStyle}>
                <div className={styles.appointmentPieChartInnerHole}>
                  <span className={styles.appointmentPieChartCenterValue}>{completionRate}%</span>
                  <span className={styles.PieCenterLabel}>Completed</span>
                </div>
              </div>

              <div className={styles.appointmentPieChartList}>
                <div className={styles.appointmentStatusRow}><span className={styles.IndicatorCompleted} /> Completed ({appointmentStatusCounts.COMPLETED})</div>
                <div className={styles.appointmentStatusRow}><span className={styles.IndicatorScheduled} /> Scheduled ({appointmentStatusCounts.SCHEDULED})</div>
                <div className={styles.appointmentStatusRow}><span className={styles.IndicatorCancelled} /> Cancelled ({appointmentStatusCounts.CANCELLED})</div>
                <div className={styles.appointmentTotalRow}>
                  <span className={styles.appointmentTotalLabel}>Total Appointments: {totalAppointments}</span>
                </div>
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>

      <div className={styles.athleteTableGrid}>
        <AdjustableCard className={styles.athleteTable}>
          <div className={styles.tableHeaderControls}>
            <h3 className={styles.analysisSectionHeading}>Athletes Analysis</h3>
            <input className={styles.tableSearchInput} placeholder="Filter athletes..." onChange={e => setCaseSearchQuery(e.target.value)} />
          </div>

          <List
            header={["Athlete", "Position", "Jersey", "Status", "Severity"]}
            data={mappedAthleteRows}
            gridTemplateColumns="1.4fr 1fr 0.6fr 1.2fr 0.8fr"
          />

          <div className={styles.tablePaginationContainer}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={page => setPage(page)} />
          </div>
        </AdjustableCard>

        <AdjustableCard className={styles.staffTable}>
          <div className={styles.tableHeaderControls}>
            <h3 className={styles.analysisSectionHeading}>Clinicians Analysis</h3>
            <input className={styles.tableSearchInput} placeholder="Search clinicians..." onChange={e => setStaffSearchQuery(e.target.value)} />
          </div>

          <List
            header={["Clinician", "Specialty", "Active Cases"]}
            data={mappedStaffAnalysisRows}
            gridTemplateColumns="1.5fr 1fr 0.8fr"
          />

          <div className={styles.tablePaginationContainer}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={page => setPage(page)} />
          </div>
        </AdjustableCard>
      </div>
    </div>
  );
};

export default ManagerDashboard;
