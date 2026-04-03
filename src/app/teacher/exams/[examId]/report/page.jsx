'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeacherExamDetails, useTeacherExamResults } from '@/hooks/useTeacherPortal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader, AlertCircle, Download, ArrowLeft } from 'lucide-react';

// ResultCard component for printing (import from admin if available)
const ResultCard = ({ result, exam, student }) => {
  const totalMarks = exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
  const obtainedMarks = result?.total_marks_obtained || 0;
  const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  return (
    <div className="p-8 bg-white border-2 border-gray-300 min-h-screen flex flex-col justify-center">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold">Examination Result</h1>
        <p className="text-gray-600 mt-2">{exam?.class?.name} {exam?.section?.name ? `- Section ${exam.section.name}` : ''}</p>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-600">Student Name</p>
          <p className="text-lg font-semibold">{student?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Roll Number</p>
          <p className="text-lg font-semibold">{student?.details?.studentDetails?.roll_no || 'N/A'}</p>
        </div>
      </div>

      {/* Marks Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-400">
            <th className="py-3 text-left font-bold">Subject</th>
            <th className="py-3 text-center font-bold">Marks</th>
            <th className="py-3 text-center font-bold">Out of</th>
            <th className="py-3 text-center font-bold">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {exam?.subject_schedules?.map((subject, idx) => {
            const subjectMark = result?.subject_marks?.find(sm => sm.subject_id === subject.subject_id);
            const marksObtained = subjectMark?.marks_obtained || 0;
            const subjectPercentage = subject.total_marks > 0 
              ? ((marksObtained / subject.total_marks) * 100).toFixed(2)
              : 0;
            return (
              <tr key={subject.subject_id} className="border-b border-gray-200">
                <td className="py-3 px-2">{subject.subject_name}</td>
                <td className="py-3 text-center font-semibold">{marksObtained}</td>
                <td className="py-3 text-center">{subject.total_marks}</td>
                <td className="py-3 text-center">{subjectPercentage}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8 p-4 bg-gray-100 rounded">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Marks</p>
          <p className="text-2xl font-bold">{obtainedMarks}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Out of</p>
          <p className="text-2xl font-bold">{totalMarks}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Percentage</p>
          <p className="text-2xl font-bold">{percentage}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Grade</p>
          <p className="text-2xl font-bold">{getGrade(percentage)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 mt-auto text-sm text-gray-600 text-center">
        <p>This is an official document of the institution</p>
      </div>
    </div>
  );
};

export default function ExamReportPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;

  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const { exam, loading: examLoading, error: examError } = useTeacherExamDetails(examId);
  const { results, loading: resultsLoading } = useTeacherExamResults(examId);

  const handlePrintResult = (studentId) => {
    setSelectedStudentId(studentId);
    setTimeout(() => window.print(), 100);
  };

  if (examLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="inline-block animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="inline-block text-red-600 mb-2" size={32} />
          <p className="text-red-600 text-lg font-medium">Failed to load exam</p>
          <p className="text-red-500 text-sm mt-2">{examError?.message || 'Exam not found'}</p>
        </Card>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-6">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-600 text-lg">No results found for this exam</p>
          <p className="text-gray-500 text-sm mt-2">Results will appear once marks are entered</p>
        </Card>
      </div>
    );
  }

  const selectedStudent = results.find(r => r.student_id === selectedStudentId);
  const selectedResult = selectedStudent;

  // Calculate exam statistics
  const stats = {
    total_students: results.length,
    submitted: results.filter(r => r.total_marks_obtained !== undefined && r.total_marks_obtained > 0).length,
    passed: results.filter(r => {
      const totalMarks = exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
      const percentage = (r.total_marks_obtained / totalMarks) * 100;
      return percentage >= 40;
    }).length,
    failed: results.filter(r => {
      const totalMarks = exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
      const percentage = (r.total_marks_obtained / totalMarks) * 100;
      return percentage < 40;
    }).length,
    avg_percentage: (results.reduce((sum, r) => {
      const totalMarks = exam?.subject_schedules?.reduce((s, subj) => s + (subj.total_marks || 0), 0) || 0;
      return sum + ((r.total_marks_obtained / totalMarks) * 100);
    }, 0) / results.length).toFixed(2)
  };

  if (selectedStudentId && selectedResult) {
    return (
      <div className="print:hidden p-6">
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setSelectedStudentId(null)} variant="outline">
            <ArrowLeft className="mr-2" size={16} />
            Back to Results
          </Button>
          <Button onClick={() => handlePrintResult(selectedStudentId)} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2" size={16} />
            Print Result
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Exam Report</h1>
          <p className="text-gray-600 mt-2">
            {exam?.class?.name} {exam?.section?.name ? `- Section ${exam.section.name}` : ''}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
      </div>

      {/* Exam Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total_students}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-gray-600">Passed</p>
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-gray-600">Average %</p>
          <p className="text-2xl font-bold text-purple-600">{stats.avg_percentage}%</p>
        </Card>
        <Card className="p-4 bg-orange-50">
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="text-2xl font-bold text-orange-600">{stats.submitted}</p>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left font-semibold text-gray-700">Student Name</th>
                <th className="p-3 text-left font-semibold text-gray-700">Roll No.</th>
                {exam?.subject_schedules?.map((subject) => (
                  <th key={subject.subject_id} className="p-3 text-center font-semibold text-gray-700">
                    <div className="text-sm">{subject.subject_name}</div>
                    <div className="text-xs text-gray-500">/ {subject.total_marks}</div>
                  </th>
                ))}
                <th className="p-3 text-center font-semibold text-gray-700">Total</th>
                <th className="p-3 text-center font-semibold text-gray-700">%</th>
                <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                <th className="p-3 text-center font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => {
                const totalMarks = exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
                const obtainedMarks = result?.total_marks_obtained || 0;
                const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;
                const isPassed = percentage >= 40;

                return (
                  <tr key={result.student_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td className="p-3">
                      <p className="font-medium">{result.student?.name || 'N/A'}</p>
                    </td>
                    <td className="p-3 text-gray-600">
                      {result.student?.details?.studentDetails?.roll_no || '-'}
                    </td>
                    {exam?.subject_schedules?.map((subject) => {
                      const subjectMark = result?.subject_marks?.find(sm => sm.subject_id === subject.subject_id);
                      return (
                        <td key={subject.subject_id} className="p-3 text-center font-semibold">
                          {subjectMark?.marks_obtained || 0}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold">{obtainedMarks}</td>
                    <td className="p-3 text-center font-bold">{percentage}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isPassed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudentId(result.student_id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
