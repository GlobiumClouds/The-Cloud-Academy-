'use client';

/**
 * ResultCard — Printable exam result card for individual students
 * Shows student details, institute info, exam details, and subject-wise marks
 */

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResultCard({ student, exam, result, institute }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (!student || !exam || !result || !institute) {
    return <div className="p-4 text-center text-muted-foreground">Loading result card...</div>;
  }

  const subjectMarks = result.subject_marks || [];
  const totalMarksObtained = result.total_marks_obtained || 0;
  const percentage = result.percentage || 0;
  const grade = result.grade || 'N/A';
  const status = result.status || 'absent';

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex justify-end">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Print Result Card
        </Button>
      </div>

      {/* Printable Content */}
      <div
        ref={printRef}
        className="bg-white p-12 rounded-lg border border-gray-200"
        style={{
          fontFamily: 'Arial, sans-serif',
          color: '#000',
          width: '100%',
          maxWidth: '850px'
        }}
      >
        {/* Header with Institute Info */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          {institute.logo_url && (
            <div className="mb-4 flex justify-center">
              <img
                src={institute.logo_url}
                alt={institute.name}
                height={60}
                width={60}
                className="object-contain"
                style={{ maxHeight: '80px' }}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{institute.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{institute.code}</p>
          <p className="text-xs text-gray-500 mt-1">
            {institute.institute_type ? institute.institute_type.charAt(0).toUpperCase() + institute.institute_type.slice(1) : 'Institute'}
          </p>
        </div>

        {/* Result Card Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Exam Result Card</h2>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-6 mb-8 border border-gray-200 p-4 rounded">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Student Name</p>
            <p className="text-base font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Roll Number</p>
            <p className="text-base font-bold text-gray-900">{student.roll_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
            <p className="text-sm text-gray-700">{student.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
            <p className="text-base font-bold text-gray-900 capitalize">{status}</p>
          </div>
        </div>

        {/* Exam Information */}
        <div className="mb-8 border border-gray-200 p-4 rounded">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Exam Details</p>
          <h3 className="text-lg font-bold text-gray-900 mb-3">{exam.name}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Total Marks</p>
              <p className="text-2xl font-bold text-gray-900">{exam.total_marks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Marks Obtained</p>
              <p className="text-2xl font-bold text-blue-600">{totalMarksObtained}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Percentage</p>
              <p className={`text-2xl font-bold ${
                percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {Number(percentage).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Subject-wise Marks */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-4">Subject-wise Marks</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border border-gray-300">
                <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                  Subject
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                  Total Marks
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                  Obtained Marks
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                  Percentage
                </th>
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
                  <tr key={subject.subject_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">
                      {subject.subject_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                      {subject.total_marks}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-blue-600">
                      {obtainedMarks}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                      {subjectPercentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Overall Result Summary */}
        <div className="border border-gray-300 p-4 rounded bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 font-semibold">GRADE</p>
              <p className="text-3xl font-bold text-indigo-600">{grade}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">PERCENTAGE</p>
              <p className={`text-3xl font-bold ${
                percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {Number(percentage).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">RESULT</p>
              <p className={`text-xl font-bold capitalize ${
                status === 'pass' ? 'text-green-600' : status === 'fail' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {status}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">This is a digitally generated result card</p>
        </div>
      </div>
    </div>
  );
}
