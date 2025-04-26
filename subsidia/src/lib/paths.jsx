
export const paths = {
   root: "/",
   login: "/login",
   register: "/register",
   dashboard: "/dashboard",
   employees: "/dashboard/employees",
   addEmployee: "/dashboard/employees/add",
   employeeId: (id) => `/dashboard/employees/${id}`,
   employeeIdEdit: (id) => `/dashboard/employees/${id}/edit`,
   salary: "/dashboard/salary",
   salaryId: (id) => `/dashboard/salary/${id}`,
   salaryBatchEntry: "/dashboard/salary/batch-entry",
   calendar: "/dashboard/calendar",
   salaryStats: "/dashboard/salary/stats",
   verifyCode: (type, user_id) => `/verify?type=${type}&id=${user_id}`,
   forgotPassword: "/forgot-password",
}