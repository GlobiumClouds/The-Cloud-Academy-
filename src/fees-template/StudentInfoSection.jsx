'use client';

const Field = ({ label, value, theme }) => (
  <div className="grid grid-cols-[120px_1fr] border-b px-2 py-1 last:border-b-0" style={{ borderColor: theme.colors.border }}>
    <span className="font-semibold" style={{ fontSize: theme.fontSize.small }}>{label}</span>
    <span style={{ fontSize: theme.fontSize.body }}>{value || 'N/A'}</span>
  </div>
);

export default function StudentInfoSection({ studentData = {}, voucherMeta = {}, theme }) {
  return (
    <section className="border" style={{ borderColor: theme.colors.border }}>
      <div className="border-b px-2 py-1 text-center font-bold uppercase" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.tableHeader, fontSize: theme.fontSize.body }}>
        Student Information
      </div>
      <div className="grid grid-cols-2">
        <div>
          <Field label="Student Name" value={studentData.studentName} theme={theme} />
          <Field label="Father Name" value={studentData.fatherName} theme={theme} />
          <Field label="Student ID" value={studentData.studentId} theme={theme} />
          <Field label="Roll Number" value={studentData.rollNumber} theme={theme} />
        </div>
        <div className="border-l" style={{ borderColor: theme.colors.border }}>
          <Field label="Class" value={studentData.className} theme={theme} />
          <Field label="Section" value={studentData.section} theme={theme} />
          <Field label="Month" value={voucherMeta.month} theme={theme} />
          {/* <Field label="Fee Status" value={voucherMeta.feeStatus} theme={theme} /> */}
        </div>
      </div>
    </section>
  );
}
