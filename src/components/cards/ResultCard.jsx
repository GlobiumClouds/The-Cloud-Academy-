'use client';

/**
 * ResultCard — Professional printable exam result card for individual students
 * Shows student details, institute info, exam details, and subject-wise marks
 */

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResultCard({ student, exam, result, institute }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Result Card - ${student.first_name} ${student.last_name}</title>
          <style>
            * { margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              line-height: 1.6;
              background: white;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              padding: 40px;
              background: white;
            }
            .page {
              page-break-after: always;
              padding: 20px;
              border: 2px solid #2c3e50;
              border-radius: 8px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              max-height: 100px;
              margin-bottom: 15px;
            }
            .institute-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .institute-code {
              font-size: 14px;
              color: #555;
              letter-spacing: 1px;
            }
            .institute-type {
              font-size: 12px;
              color: #888;
              margin-top: 5px;
            }
            .title {
              text-align: center;
              font-size: 22px;
              font-weight: bold;
              color: #2c3e50;
              margin: 30px 0;
            }
            .student-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-left: 4px solid #3498db;
              border-radius: 4px;
            }
            .field {
              margin-bottom: 15px;
            }
            .field-label {
              font-size: 11px;
              font-weight: bold;
              color: #2c3e50;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .field-value {
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .exam-section {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .exam-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 15px;
            }
            .exam-header {
              font-size: 11px;
              font-weight: bold;
              color: #2c3e50;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin-top: 15px;
            }
            .stat-box {
              text-align: center;
              padding: 15px;
              background: white;
              border: 2px solid #ecf0f1;
              border-radius: 4px;
            }
            .stat-label {
              font-size: 11px;
              color: #555;
              text-transform: uppercase;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #3498db;
            }
            .subjects-section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #2c3e50;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .table thead {
              background: #2c3e50;
              color: white;
            }
            .table th {
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .table td {
              padding: 12px;
              border-bottom: 1px solid #ecf0f1;
              font-size: 13px;
            }
            .table tbody tr:nth-child(even) {
              background: #f8f9fa;
            }
            .table tbody tr:hover {
              background: #eef2f7;
            }
            .result-summary {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin: 30px 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 4px;
            }
            .summary-box {
              text-align: center;
              color: white;
            }
            .summary-label {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              opacity: 0.9;
              margin-bottom: 10px;
            }
            .summary-value {
              font-size: 32px;
              font-weight: bold;
            }
            .footer {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid #ddd;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 70%;
              margin: 40px auto 5px;
            }
            .signature-text {
              font-size: 12px;
              color: #666;
              font-weight: bold;
            }
            .date-text {
              font-size: 12px;
              color: #888;
              margin-top: 20px;
              text-align: center;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .container { margin: 0; padding: 0; }
              .page { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${printRef.current?.innerHTML || ''}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  // Improved validation - show more helpful debug info
  if (!student || !exam || !result) {
    return <div className="p-4 text-center text-muted-foreground">
      Loading result card... 
      {!student && <div className="text-xs mt-2">Student: Missing</div>}
      {!exam && <div className="text-xs mt-2">Exam: Missing</div>}
      {!result && <div className="text-xs mt-2">Result: Missing</div>}
    </div>;
  }

  // Institute is optional - use placeholder if not provided
  const instituteData = institute || {
    name: 'Institute Name',
    code: 'INST-CODE',
    logo_url: null,
    institute_type: 'institution'
  };

  const subjectMarks = result.subject_marks || [];
  const totalMarksObtained = result.total_marks_obtained || 0;
  const percentage = result.percentage || 0;
  const grade = result.grade || 'N/A';
  const status = result.status || 'absent';
  
  // Use actual registration number from student data
  const registrationNo = student.registration_no || 'N/A';

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          Print Result Card
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white print:bg-white">
        <div className="page" style={{ pageBreakAfter: 'always' }}>
          {/* Header */}
          <div className="header" style={{ textAlign: 'center', borderBottom: '3px solid #2c3e50', paddingBottom: '20px', marginBottom: '30px' }}>
            {instituteData.logo_url && (
              <div style={{ marginBottom: '15px' }}>
                <img
                  src={instituteData.logo_url}
                  alt={instituteData.name}
                  style={{ maxHeight: '100px', margin: '0 auto' }}
                />
              </div>
            )}
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
              {instituteData.name}
            </div>
            <div style={{ fontSize: '14px', color: '#555', letterSpacing: '1px' }}>
              {instituteData.code}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
              {instituteData.institute_type?.charAt(0).toUpperCase() + instituteData.institute_type?.slice(1)}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', margin: '30px 0' }}>
            EXAM RESULT CARD
          </div>

          {/* Student Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderLeft: '4px solid #3498db',
            borderRadius: '4px'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                Student Name
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                {student.first_name} {student.last_name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                Roll Number
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                {student.roll_number || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                Registration No
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                {registrationNo}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                Status
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: status === 'pass' ? '#27ae60' : status === 'fail' ? '#e74c3c' : '#95a5a6', textTransform: 'capitalize' }}>
                {status}
              </div>
            </div>
          </div>

          {/* Exam Information */}
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Exam Details
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>
              {exam.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', border: '2px solid #ecf0f1', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
                  Total Marks
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
                  {exam.total_marks}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', border: '2px solid #ecf0f1', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
                  Marks Obtained
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
                  {totalMarksObtained}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', border: '2px solid #ecf0f1', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
                  Percentage
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: percentage >= 70 ? '#27ae60' : percentage >= 50 ? '#f39c12' : '#e74c3c' }}>
                  {Number(percentage).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Subject-wise Marks Table */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '15px' }}>
              Subject-wise Performance
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#2c3e50', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #2c3e50' }}>Subject</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #2c3e50' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #2c3e50' }}>Obtained</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #2c3e50' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {exam.subject_schedules && exam.subject_schedules.map((subject, idx) => {
                  const subjectMark = subjectMarks.find(s => s.subject_id === subject.subject_id);
                  const obtainedMarks = subjectMark?.marks_obtained || 0;
                  const subjectPercentage = subject.total_marks > 0 
                    ? ((obtainedMarks / subject.total_marks) * 100).toFixed(2)
                    : 0;

                  return (
                    <tr key={subject.subject_id} style={{ background: idx % 2 === 0 ? 'white' : '#f8f9fa', borderBottom: '1px solid #ecf0f1' }}>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '500', color: '#333' }}>
                        {subject.subject_name}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#333' }}>
                        {subject.total_marks}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#27ae60' }}>
                        {obtainedMarks}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#3498db' }}>
                        {subjectPercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Result Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px',
            margin: '30px 0',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '4px'
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, marginBottom: '10px' }}>
                Grade
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                {grade}
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, marginBottom: '10px' }}>
                Overall Score
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                {Number(percentage).toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, marginBottom: '10px' }}>
                Result
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {status}
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #ddd' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', width: '70%', margin: '40px auto 5px' }}></div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                Class Teacher
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', width: '70%', margin: '40px auto 5px' }}></div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                Head of Institute
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: '12px', color: '#888', marginTop: '20px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <p>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style={{ marginTop: '5px', fontSize: '11px', color: '#999' }}>This is an officially issued digital result card</p>
          </div>
        </div>
      </div>
    </div>
  );
}
