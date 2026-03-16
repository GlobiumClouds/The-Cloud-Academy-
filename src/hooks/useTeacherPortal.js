// frontend/src/hooks/useTeacherPortal.js

/**
 * Custom hooks for Teacher Portal
 * Makes it easy to use teacher portal service in components
 */

import { useState, useEffect, useCallback } from 'react';
import { teacherPortalService } from '@/services/teacherPortalService';
import { toast } from 'sonner';

const toArray = (value) => (Array.isArray(value) ? value : []);

const extractListPayload = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination || { total: payload.length, page: 1, limit: payload.length || 20, totalPages: 1 }
    };
  }

  if (Array.isArray(payload?.data)) {
    return {
      items: payload.data,
      pagination: payload.pagination || response?.pagination || { total: payload.data.length, page: 1, limit: payload.data.length || 20, totalPages: 1 }
    };
  }

  return {
    items: [],
    pagination: response?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
  };
};

export const useTeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getDashboard();
      setData(response.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboard };
};

export const useTeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await teacherPortalService.getProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await teacherPortalService.updateProfile(formData);
      setProfile(response.data);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};

export const useTeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await teacherPortalService.getMyClasses();
      setClasses(toArray(response?.data));
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const getClassDetails = async (classId) => {
    try {
      const response = await teacherPortalService.getClassDetails(classId);
      return response.data;
    } catch (error) {
      toast.error('Failed to load class details');
      throw error;
    }
  };

  return { classes, loading, getClassDetails, refetch: fetchClasses };
};

export const useTeacherStudents = (initialFilters = {}) => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const fetchStudents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getMyStudents(filters, page, pagination.limit);
      const { items, pagination: pager } = extractListPayload(response);
      setStudents(items);
      setPagination(pager);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const search = useCallback((searchTerm) => {
    setFilters((prev) => (
      prev.search === searchTerm
        ? prev
        : { ...prev, search: searchTerm }
    ));
  }, []);

  const filterByClass = useCallback((classId) => {
    setFilters((prev) => (
      prev.class_id === classId
        ? prev
        : { ...prev, class_id: classId }
    ));
  }, []);

  const getStudentDetails = useCallback(async (studentId) => {
    try {
      const response = await teacherPortalService.getStudentDetails(studentId);
      return response.data;
    } catch (error) {
      toast.error('Failed to load student details');
      throw error;
    }
  }, []);

  return {
    students,
    pagination,
    loading,
    filters,
    search,
    filterByClass,
    getStudentDetails,
    refetch: fetchStudents,
    nextPage: () => fetchStudents(pagination.page + 1),
    prevPage: () => fetchStudents(pagination.page - 1)
  };
};

export const useTeacherAssignments = (initialFilters = {}) => {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const fetchAssignments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getMyAssignments(filters, page, pagination.limit);
      const { items, pagination: pager } = extractListPayload(response);
      setAssignments(items);
      setPagination(pager);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(1);
  }, [filters]);

  const createAssignment = async (formData) => {
    try {
      const response = await teacherPortalService.createAssignment(formData);
      toast.success('Assignment created successfully');
      fetchAssignments(1);
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to create assignment');
      throw error;
    }
  };

  const getAssignmentDetails = async (assignmentId) => {
    try {
      const response = await teacherPortalService.getAssignmentDetails(assignmentId);
      return response.data;
    } catch (error) {
      toast.error('Failed to load assignment details');
      throw error;
    }
  };

  const updateAssignment = async (assignmentId, formData) => {
    try {
      const response = await teacherPortalService.updateAssignment(assignmentId, formData);
      toast.success('Assignment updated successfully');
      fetchAssignments(pagination.page);
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to update assignment');
      throw error;
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await teacherPortalService.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      fetchAssignments(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Failed to delete assignment');
      throw error;
    }
  };

  const gradeSubmission = async (submissionId, marks, feedback) => {
    try {
      const response = await teacherPortalService.gradeSubmission(submissionId, { marks, feedback });
      toast.success('Submission graded successfully');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to grade submission');
      throw error;
    }
  };

  return {
    assignments,
    pagination,
    loading,
    filters,
    setFilters,
    createAssignment,
    getAssignmentDetails,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
    refetch: fetchAssignments,
    nextPage: () => fetchAssignments(pagination.page + 1),
    prevPage: () => fetchAssignments(pagination.page - 1)
  };
};

export const useTeacherAttendance = () => {
  const [loading, setLoading] = useState(false);

  const markAttendance = useCallback(async (attendanceData) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.markAttendance(attendanceData);
      toast.success('Attendance marked successfully');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to mark attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClassAttendance = useCallback(async (classId, date) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getClassAttendance(classId, date);
      return response.data;
    } catch (error) {
      toast.error('Failed to load attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudentAttendance = useCallback(async (studentId) => {
    try {
      const response = await teacherPortalService.getStudentAttendance(studentId);
      return response.data;
    } catch (error) {
      toast.error('Failed to load student attendance');
      throw error;
    }
  }, []);

  return {
    loading,
    markAttendance,
    getClassAttendance,
    getStudentAttendance
  };
};

export const useTeacherTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, [week]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getMyTimetable(week);
      setTimetable(response.data);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (newWeek) => {
    setWeek(newWeek);
  };

  const nextWeek = () => {
    // Calculate next week from current week
    if (timetable?.week?.start) {
      const next = new Date(timetable.week.start);
      next.setDate(next.getDate() + 7);
      setWeek(next.toISOString().split('T')[0]);
    }
  };

  const prevWeek = () => {
    if (timetable?.week?.start) {
      const prev = new Date(timetable.week.start);
      prev.setDate(prev.getDate() - 7);
      setWeek(prev.toISOString().split('T')[0]);
    }
  };

  return {
    timetable,
    loading,
    week,
    changeWeek,
    nextWeek,
    prevWeek,
    refetch: fetchTimetable
  };
};

export const useTeacherNotices = (limit = 10) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await teacherPortalService.getNotices(limit);
      setNotices(response.data);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  return { notices, loading, refetch: fetchNotices };
};