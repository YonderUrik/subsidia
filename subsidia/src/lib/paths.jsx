
export const paths = {
   // ROOT
   dashboard: "/dashboard",
   // AUTH
   root: "/",
   login: "/login",
   register: "/register",
   verifyCode: (type, user_id) => `/verify?type=${type}&id=${user_id}`,
   forgotPassword: "/forgot-password",
   // Employees
   employees: "/dashboard/employees",
   addEmployee: "/dashboard/employees/add",
   employeeId: (id) => `/dashboard/employees/${id}`,
   employeeIdEdit: (id) => `/dashboard/employees/${id}/edit`,
   // Salary
   salary: "/dashboard/salary",
   salaryId: (id) => `/dashboard/salary/${id}`,
   salaryBatchEntry: "/dashboard/salary/batch-entry",
   // Calendar
   calendar: "/dashboard/calendar",
   salaryStats: "/dashboard/salary/stats",
   // harvestes
   harvests: "/dashboard/harvests",
   harvestsList: "/dashboard/harvests/list",
   harvestsStats: "/dashboard/harvests/stats",
   new_harvest: "/dashboard/harvests/new",
   // Lands
   lands: "/dashboard/lands",
   new_land: "/dashboard/lands/new",
   landId: (id) => `/dashboard/lands/${id}`,
   landIdEdit: (id) => `/dashboard/lands/${id}/edit`
}